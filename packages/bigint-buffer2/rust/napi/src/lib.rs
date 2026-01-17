//! Node.js native bindings for BigInt/buffer conversion using napi-rs.
//!
//! This crate exposes the core conversion algorithms to Node.js via N-API,
//! providing high-performance BigInt/Buffer conversion.

use napi::bindgen_prelude::*;
use napi_derive::napi;
use bigint_buffer2_core as core;

/// Convert BigInt to BE buffer using slice (avoids Uint8Array overhead)
#[napi]
pub fn to_buffer_be_fast(num: BigInt, buffer: &[u8]) {
    let width = buffer.len();
    if width == 0 {
        return;
    }

    let dest_ptr = buffer.as_ptr() as *mut u8;

    if num.words.is_empty() {
        // Zero the entire buffer for value 0
        for i in 0..width {
            unsafe { std::ptr::write_volatile(dest_ptr.add(i), 0); }
        }
        return;
    }

    // Get words (with two's complement for negative)
    let words: Vec<u64>;
    let words_ref: &[u64] = if num.sign_bit {
        words = core::twos_complement(&num.words, width);
        &words
    } else {
        &num.words
    };

    // Calculate positions for word-sized writes
    let full_words = width / 8;
    let words_to_write = full_words.min(words_ref.len());

    // Write full 8-byte words using a single volatile u64 write each
    // Words are LSW-first, output is BE (so LSW goes at highest address)
    for i in 0..words_to_write {
        let word = words_ref[i];
        let dest_offset = width - (i + 1) * 8;
        // Convert to BE bytes and write as u64 (single 8-byte volatile write)
        let be_word = word.swap_bytes();  // Convert to big-endian word
        unsafe {
            std::ptr::write_volatile(dest_ptr.add(dest_offset) as *mut u64, be_word);
        }
    }

    // Handle partial bytes at the beginning (high-order padding and partial word)
    let remaining_start = width - words_to_write * 8;

    // Zero high-order padding
    let padding_end = if words_to_write < words_ref.len() {
        // There's a partial word to write
        let word = words_ref[words_to_write];
        let word_bytes = word.to_be_bytes();
        let bytes_to_write = remaining_start.min(8);
        let src_start = 8 - bytes_to_write;
        for i in 0..bytes_to_write {
            unsafe {
                std::ptr::write_volatile(
                    dest_ptr.add(remaining_start - bytes_to_write + i),
                    word_bytes[src_start + i]
                );
            }
        }
        remaining_start - bytes_to_write
    } else {
        remaining_start
    };

    // Zero any remaining padding at the beginning
    for i in 0..padding_end {
        unsafe { std::ptr::write_volatile(dest_ptr.add(i), 0); }
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

    if num.words.is_empty() {
        // Zero the entire buffer for value 0
        for i in 0..width {
            unsafe { std::ptr::write_volatile(dest_ptr.add(i), 0); }
        }
        return;
    }

    // Get words (with two's complement for negative)
    let words: Vec<u64>;
    let words_ref: &[u64] = if num.sign_bit {
        words = core::twos_complement(&num.words, width);
        &words
    } else {
        &num.words
    };

    // Calculate positions for word-sized writes
    let full_words = width / 8;
    let words_to_write = full_words.min(words_ref.len());

    // Write full 8-byte words using a single volatile u64 write each
    // Words are LSW-first, output is LE (so word[i] goes to position i*8)
    for i in 0..words_to_write {
        let word = words_ref[i];
        let dest_offset = i * 8;
        // Write as u64 directly (already in LE format on x86/ARM)
        unsafe {
            std::ptr::write_volatile(dest_ptr.add(dest_offset) as *mut u64, word);
        }
    }

    // Handle partial word at the end
    let partial_start = words_to_write * 8;
    if partial_start < width && words_to_write < words_ref.len() {
        let word = words_ref[words_to_write];
        let word_bytes = word.to_le_bytes();
        let bytes_to_write = (width - partial_start).min(8);
        for i in 0..bytes_to_write {
            unsafe {
                std::ptr::write_volatile(dest_ptr.add(partial_start + i), word_bytes[i]);
            }
        }
    }

    // Zero remaining high bytes
    let written = partial_start + if words_to_write < words_ref.len() {
        (width - partial_start).min(8)
    } else {
        0
    };
    for i in written..width {
        unsafe { std::ptr::write_volatile(dest_ptr.add(i), 0); }
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
        let num = BigInt {
            sign_bit: false,
            words: vec![0x0102030405060708u64],
        };
        let buffer = vec![0u8; 8];
        to_buffer_be_fast(num.clone(), &buffer);
        let recovered = to_bigint_be(&buffer);
        assert_eq!(recovered.words, num.words);
    }

    #[test]
    fn test_roundtrip_le() {
        let num = BigInt {
            sign_bit: false,
            words: vec![0x0102030405060708u64],
        };
        let buffer = vec![0u8; 8];
        to_buffer_le_fast(num.clone(), &buffer);
        let recovered = to_bigint_le(&buffer);
        assert_eq!(recovered.words, num.words);
    }

    #[test]
    fn test_roundtrip_be_large() {
        // 16 words for 128 bytes
        let words: Vec<u64> = (1..=16).map(|i| i * 0x0102030405060708u64).collect();
        let num = BigInt {
            sign_bit: false,
            words: words.clone(),
        };
        let buffer = vec![0u8; 128];
        to_buffer_be_fast(num, &buffer);
        let recovered = to_bigint_be(&buffer);
        assert_eq!(recovered.words, words);
    }

    #[test]
    fn test_roundtrip_le_large() {
        // 16 words for 128 bytes
        let words: Vec<u64> = (1..=16).map(|i| i * 0x0102030405060708u64).collect();
        let num = BigInt {
            sign_bit: false,
            words: words.clone(),
        };
        let buffer = vec![0u8; 128];
        to_buffer_le_fast(num, &buffer);
        let recovered = to_bigint_le(&buffer);
        assert_eq!(recovered.words, words);
    }
}
