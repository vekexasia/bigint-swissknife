//! Node.js native bindings for BigInt/buffer conversion using napi-rs.
//!
//! This crate exposes the core conversion algorithms to Node.js via N-API,
//! providing high-performance BigInt/Buffer conversion.

use napi::bindgen_prelude::*;
use napi_derive::napi;
use bigint_buffer2_core as core;
use std::ptr::NonNull;

/// A lightweight mutable buffer type that skips napi reference counting overhead.
///
/// The standard napi `Buffer` type creates/deletes references on each call which
/// adds ~50-60ns overhead. This type directly gets the buffer pointer, providing
/// near-C performance for mutable buffer access.
///
/// # Safety
/// This type is only valid for the duration of the native function call.
/// The underlying JS Buffer must not be accessed from JS while Rust holds this reference.
pub struct BufferMut {
    inner: NonNull<u8>,
    len: usize,
}

impl napi::bindgen_prelude::FromNapiValue for BufferMut {
    unsafe fn from_napi_value(
        env: napi::sys::napi_env,
        napi_val: napi::sys::napi_value,
    ) -> napi::Result<Self> {
        let mut buf = std::ptr::null_mut();
        let mut len = 0usize;

        // Skip napi_create_reference - just get the buffer pointer directly
        napi::check_status!(
            unsafe { napi::sys::napi_get_buffer_info(env, napi_val, &mut buf, &mut len as *mut usize) },
            "Failed to get Buffer pointer and length"
        )?;

        // Handle null pointer case (empty buffer)
        let inner = match NonNull::new(buf as *mut u8) {
            Some(buf) if len != 0 => buf,
            _ => NonNull::dangling(),
        };

        Ok(Self { inner, len })
    }
}

impl BufferMut {
    /// Get a mutable slice to the buffer contents
    #[inline(always)]
    pub fn as_mut_slice(&mut self) -> &mut [u8] {
        if self.len == 0 {
            &mut []
        } else {
            unsafe { std::slice::from_raw_parts_mut(self.inner.as_ptr(), self.len) }
        }
    }

    /// Get the length of the buffer
    #[inline(always)]
    pub fn len(&self) -> usize {
        self.len
    }
}

/// Internal: Write BigInt to BE buffer (mutable slice)
///
/// # Safety
/// Uses unsafe pointer writes for performance, but all accesses are within
/// bounds of the mutable slice we own.
fn write_be(words: &[u64], sign_bit: bool, dest: &mut [u8]) {
    let width = dest.len();
    if width == 0 {
        return;
    }

    let dest_ptr = dest.as_mut_ptr();

    if words.is_empty() {
        // Zero the entire buffer for value 0
        unsafe { std::ptr::write_bytes(dest_ptr, 0, width); }
        return;
    }

    // Get words (with two's complement for negative)
    let tc_words: Vec<u64>;
    let words_ref: &[u64] = if sign_bit {
        tc_words = core::twos_complement(words, width);
        &tc_words
    } else {
        words
    };

    // Calculate positions for word-sized writes
    let full_words = width / 8;
    let words_to_write = full_words.min(words_ref.len());

    // Write full 8-byte words using direct pointer writes
    // Words are LSW-first, output is BE (so LSW goes at highest address)
    for i in 0..words_to_write {
        let word = words_ref[i];
        let dest_offset = width - (i + 1) * 8;
        // Convert to BE and write as u64 (unaligned write)
        let be_word = word.swap_bytes();
        unsafe {
            std::ptr::write_unaligned(dest_ptr.add(dest_offset) as *mut u64, be_word);
        }
    }

    // Handle partial bytes at the beginning (high-order padding and partial word)
    let remaining_start = width - words_to_write * 8;

    let padding_end = if words_to_write < words_ref.len() {
        // There's a partial word to write
        let word = words_ref[words_to_write];
        let word_bytes = word.to_be_bytes();
        let bytes_to_write = remaining_start.min(8);
        let src_start = 8 - bytes_to_write;
        let dest_start = remaining_start - bytes_to_write;
        for j in 0..bytes_to_write {
            unsafe {
                std::ptr::write(dest_ptr.add(dest_start + j), word_bytes[src_start + j]);
            }
        }
        dest_start
    } else {
        remaining_start
    };

    // Zero any remaining padding at the beginning
    if padding_end > 0 {
        unsafe { std::ptr::write_bytes(dest_ptr, 0, padding_end); }
    }
}

/// Internal: Write BigInt to LE buffer (mutable slice)
///
/// # Safety
/// Uses unsafe pointer writes for performance, but all accesses are within
/// bounds of the mutable slice we own.
fn write_le(words: &[u64], sign_bit: bool, dest: &mut [u8]) {
    let width = dest.len();
    if width == 0 {
        return;
    }

    let dest_ptr = dest.as_mut_ptr();

    if words.is_empty() {
        // Zero the entire buffer for value 0
        unsafe { std::ptr::write_bytes(dest_ptr, 0, width); }
        return;
    }

    // Get words (with two's complement for negative)
    let tc_words: Vec<u64>;
    let words_ref: &[u64] = if sign_bit {
        tc_words = core::twos_complement(words, width);
        &tc_words
    } else {
        words
    };

    // Calculate positions for word-sized writes
    let full_words = width / 8;
    let words_to_write = full_words.min(words_ref.len());

    // Write full 8-byte words using direct pointer writes
    // Words are LSW-first, output is LE (so word[i] goes to position i*8)
    for i in 0..words_to_write {
        let word = words_ref[i];
        let dest_offset = i * 8;
        // Write as u64 directly (already in LE format on x86/ARM)
        unsafe {
            std::ptr::write_unaligned(dest_ptr.add(dest_offset) as *mut u64, word);
        }
    }

    // Handle partial word at the end
    let partial_start = words_to_write * 8;
    let written = if partial_start < width && words_to_write < words_ref.len() {
        let word = words_ref[words_to_write];
        let word_bytes = word.to_le_bytes();
        let bytes_to_write = (width - partial_start).min(8);
        for j in 0..bytes_to_write {
            unsafe {
                std::ptr::write(dest_ptr.add(partial_start + j), word_bytes[j]);
            }
        }
        partial_start + bytes_to_write
    } else {
        partial_start
    };

    // Zero remaining high bytes
    if written < width {
        unsafe { std::ptr::write_bytes(dest_ptr.add(written), 0, width - written); }
    }
}

/// Convert BigInt to BE buffer using BufferMut (minimal overhead)
#[napi]
pub fn to_buffer_be_fast(num: BigInt, mut buffer: BufferMut) {
    write_be(&num.words, num.sign_bit, buffer.as_mut_slice());
}

/// Convert BigInt to LE buffer using BufferMut (minimal overhead)
#[napi]
pub fn to_buffer_le_fast(num: BigInt, mut buffer: BufferMut) {
    write_le(&num.words, num.sign_bit, buffer.as_mut_slice());
}

/// Convert a big-endian buffer to BigInt.
///
/// # Arguments
/// * `buffer` - Big-endian byte buffer (accepts Buffer or Uint8Array)
///
/// # Returns
/// BigInt value
///
/// # Example
/// ```javascript
/// const { toBigIntBe } = require('@vekexasia/bigint-buffer2');
/// const buf = Buffer.from([0x01, 0x02, 0x03, 0x04]);
/// const num = toBigIntBe(buf); // 16909060n
/// ```
#[napi]
#[inline(always)]
pub fn to_bigint_be(buffer: &[u8]) -> BigInt {
    let words = core::be_bytes_to_words(buffer);

    if words.is_empty() {
        return BigInt::from(0i64);
    }

    BigInt {
        sign_bit: false,
        words,
    }
}

/// Convert a little-endian buffer to BigInt.
///
/// # Arguments
/// * `buffer` - Little-endian byte buffer (accepts Buffer or Uint8Array)
///
/// # Returns
/// BigInt value
#[napi]
#[inline(always)]
pub fn to_bigint_le(buffer: &[u8]) -> BigInt {
    let words = core::le_bytes_to_words(buffer);

    if words.is_empty() {
        return BigInt::from(0i64);
    }

    BigInt {
        sign_bit: false,
        words,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_roundtrip_be() {
        let words = vec![0x0102030405060708u64];
        let mut buffer = vec![0u8; 8];
        write_be(&words, false, &mut buffer);
        let recovered = to_bigint_be(&buffer);
        assert_eq!(recovered.words, words);
    }

    #[test]
    fn test_roundtrip_le() {
        let words = vec![0x0102030405060708u64];
        let mut buffer = vec![0u8; 8];
        write_le(&words, false, &mut buffer);
        let recovered = to_bigint_le(&buffer);
        assert_eq!(recovered.words, words);
    }

    #[test]
    fn test_roundtrip_be_large() {
        // 16 words for 128 bytes
        let words: Vec<u64> = (1..=16).map(|i| i * 0x0102030405060708u64).collect();
        let mut buffer = vec![0u8; 128];
        write_be(&words, false, &mut buffer);
        let recovered = to_bigint_be(&buffer);
        assert_eq!(recovered.words, words);
    }

    #[test]
    fn test_roundtrip_le_large() {
        // 16 words for 128 bytes
        let words: Vec<u64> = (1..=16).map(|i| i * 0x0102030405060708u64).collect();
        let mut buffer = vec![0u8; 128];
        write_le(&words, false, &mut buffer);
        let recovered = to_bigint_le(&buffer);
        assert_eq!(recovered.words, words);
    }
}
