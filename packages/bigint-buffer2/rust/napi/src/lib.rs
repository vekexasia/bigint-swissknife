//! Node.js native bindings for BigInt/buffer conversion using napi-rs.
//!
//! This crate exposes the core conversion algorithms to Node.js via N-API,
//! providing high-performance BigInt/Buffer conversion.

use napi::bindgen_prelude::*;
use napi_derive::napi;
use bigint_buffer2_core as core;

/// No-op function to measure BigInt parameter overhead
#[napi]
pub fn bigint_noop(_num: BigInt) {}

/// No-op function to measure buffer parameter overhead (slice)
#[napi]
pub fn buffer_noop(_buffer: &[u8]) {}

/// No-op function to measure Uint8Array parameter overhead
#[napi]
pub fn uint8array_noop(_buffer: Uint8Array) {}

/// No-op with both params to measure combined overhead
#[napi]
pub fn both_noop(_num: BigInt, _buffer: Uint8Array) {}

/// No-op with BigInt and slice params
#[napi]
pub fn both_slice_noop(_num: BigInt, _buffer: &[u8]) {}

/// Simple test - just zero the buffer
#[napi]
pub fn test_zero(buffer: &[u8]) {
    let ptr = buffer.as_ptr() as *mut u8;
    for i in 0..buffer.len() {
        unsafe {
            std::ptr::write_volatile(ptr.add(i), 0);
        }
    }
}

/// Fast BigInt to BE buffer using slice (avoids Uint8Array overhead)
#[napi]
pub fn to_buffer_be_fast(num: BigInt, buffer: &[u8]) {
    let width = buffer.len();
    if width == 0 {
        return;
    }

    let dest_ptr = buffer.as_ptr() as *mut u8;

    // Zero with volatile writes
    for i in 0..width {
        unsafe { std::ptr::write_volatile(dest_ptr.add(i), 0); }
    }

    if num.words.is_empty() {
        return;
    }

    let words: std::borrow::Cow<[u64]> = if num.sign_bit && !num.words.is_empty() {
        std::borrow::Cow::Owned(twos_complement(&num.words, width))
    } else {
        std::borrow::Cow::Borrowed(&num.words)
    };

    // Write words byte by byte with volatile
    let mut pos = width;
    for &word in words.iter() {
        let word_bytes = word.to_le_bytes();
        for &byte in word_bytes.iter() {
            if pos == 0 {
                return;
            }
            pos -= 1;
            unsafe { std::ptr::write_volatile(dest_ptr.add(pos), byte); }
        }
    }
}

/// Fast BigInt to LE buffer using slice (avoids Uint8Array overhead)
#[napi]
pub fn to_buffer_le_fast(num: BigInt, buffer: &[u8]) {
    let width = buffer.len();
    if width == 0 {
        return;
    }

    let dest_ptr = buffer.as_ptr() as *mut u8;

    // Zero with volatile writes
    for i in 0..width {
        unsafe { std::ptr::write_volatile(dest_ptr.add(i), 0); }
    }

    if num.words.is_empty() {
        return;
    }

    let words: std::borrow::Cow<[u64]> = if num.sign_bit && !num.words.is_empty() {
        std::borrow::Cow::Owned(twos_complement(&num.words, width))
    } else {
        std::borrow::Cow::Borrowed(&num.words)
    };

    // Write words byte by byte with volatile (LE: start from position 0)
    let mut pos = 0;
    for &word in words.iter() {
        let word_bytes = word.to_le_bytes();
        for &byte in word_bytes.iter() {
            if pos >= width {
                return;
            }
            unsafe { std::ptr::write_volatile(dest_ptr.add(pos), byte); }
            pos += 1;
        }
    }
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

/// Convert a BigInt to big-endian buffer with specified width.
///
/// # Arguments
/// * `num` - BigInt value to convert
/// * `width` - Desired buffer width in bytes
///
/// # Returns
/// Big-endian buffer of exactly `width` bytes
///
/// # Example
/// ```javascript
/// const { toBufferBe } = require('@vekexasia/bigint-buffer2');
/// const buf = toBufferBe(16909060n, 4); // Buffer [0x01, 0x02, 0x03, 0x04]
/// ```
#[napi]
pub fn to_buffer_be(num: BigInt, width: u32) -> Buffer {
    // Handle negative numbers - convert to unsigned representation
    // (matching bigint-buffer behavior)
    let words = if num.sign_bit && !num.words.is_empty() {
        // For negative numbers, we need two's complement
        // This matches the JS behavior of treating the BigInt as unsigned
        twos_complement(&num.words, width as usize)
    } else {
        num.words.clone()
    };

    let bytes = core::words_to_be_bytes(&words, width as usize);
    Buffer::from(bytes)
}

/// Convert a BigInt to little-endian buffer with specified width.
///
/// # Arguments
/// * `num` - BigInt value to convert
/// * `width` - Desired buffer width in bytes
///
/// # Returns
/// Little-endian buffer of exactly `width` bytes
#[napi]
pub fn to_buffer_le(num: BigInt, width: u32) -> Buffer {
    let words = if num.sign_bit && !num.words.is_empty() {
        twos_complement(&num.words, width as usize)
    } else {
        num.words.clone()
    };

    let bytes = core::words_to_le_bytes(&words, width as usize);
    Buffer::from(bytes)
}

/// Convert a BigInt to big-endian bytes, writing directly into a provided buffer.
///
/// This is an optimized version that avoids buffer allocation by writing
/// directly into a pre-allocated buffer from JavaScript.
///
/// # Arguments
/// * `num` - BigInt value to convert
/// * `buffer` - Pre-allocated buffer to write into (width is inferred from length)
///
/// # Example
/// ```javascript
/// const { toBufferBeInto } = require('@vekexasia/bigint-buffer2');
/// const buf = Buffer.alloc(4);
/// toBufferBeInto(16909060n, buf); // buf is now [0x01, 0x02, 0x03, 0x04]
/// ```
#[napi]
pub fn to_buffer_be_into(num: BigInt, mut buffer: Uint8Array) {
    let dest = buffer.as_mut();
    let width = dest.len();
    if width == 0 {
        return;
    }

    // Fast path: positive numbers (most common)
    if !num.sign_bit || num.words.is_empty() {
        core::words_to_be_bytes_into(&num.words, dest);
    } else {
        // Slow path: negative numbers need two's complement
        let words = twos_complement(&num.words, width);
        core::words_to_be_bytes_into(&words, dest);
    }
}

/// Convert a BigInt to little-endian bytes, writing directly into a provided buffer.
///
/// # Arguments
/// * `num` - BigInt value to convert
/// * `buffer` - Pre-allocated buffer to write into (width is inferred from length)
#[napi]
pub fn to_buffer_le_into(num: BigInt, mut buffer: Uint8Array) {
    let dest = buffer.as_mut();
    let width = dest.len();
    if width == 0 {
        return;
    }

    // Fast path: positive numbers (most common)
    if !num.sign_bit || num.words.is_empty() {
        core::words_to_le_bytes_into(&num.words, dest);
    } else {
        // Slow path: negative numbers need two's complement
        let words = twos_complement(&num.words, width);
        core::words_to_le_bytes_into(&words, dest);
    }
}

/// Calculate two's complement for negative numbers.
/// This converts a negative BigInt to its unsigned representation
/// for a given byte width.
fn twos_complement(words: &[u64], width: usize) -> Vec<u64> {
    if words.is_empty() || width == 0 {
        return Vec::new();
    }

    let num_words = (width + 7) / 8;
    let mut result = vec![0u64; num_words];

    // Copy original words
    for (i, &word) in words.iter().enumerate() {
        if i < num_words {
            result[i] = word;
        }
    }

    // Invert all bits
    for word in &mut result {
        *word = !*word;
    }

    // Add 1 (with carry propagation)
    let mut carry = 1u64;
    for word in &mut result {
        let (sum, overflow) = word.overflowing_add(carry);
        *word = sum;
        carry = if overflow { 1 } else { 0 };
        if carry == 0 {
            break;
        }
    }

    // Mask the last word if width is not a multiple of 8
    let extra_bits = (width * 8) % 64;
    if extra_bits != 0 && !result.is_empty() {
        let last_idx = result.len() - 1;
        result[last_idx] &= (1u64 << extra_bits) - 1;
    }

    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_roundtrip_be() {
        let num = BigInt {
            sign_bit: false,
            words: vec![0x0102030405060708u64],
        };
        let buffer = to_buffer_be(num.clone(), 8);
        let recovered = to_bigint_be(buffer);
        assert_eq!(recovered.words, num.words);
    }

    #[test]
    fn test_roundtrip_le() {
        let num = BigInt {
            sign_bit: false,
            words: vec![0x0102030405060708u64],
        };
        let buffer = to_buffer_le(num.clone(), 8);
        let recovered = to_bigint_le(buffer);
        assert_eq!(recovered.words, num.words);
    }
}
