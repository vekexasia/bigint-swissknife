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

    let words: std::borrow::Cow<[u64]> = if num.sign_bit && !num.words.is_empty() {
        std::borrow::Cow::Owned(core::twos_complement(&num.words, width))
    } else {
        std::borrow::Cow::Borrowed(&num.words)
    };

    // Write words byte by byte with volatile (BE: start from end)
    let mut pos = width;
    for &word in words.iter() {
        let word_bytes = word.to_le_bytes();
        for &byte in word_bytes.iter() {
            if pos == 0 {
                // Zero remaining leading bytes (already at start)
                return;
            }
            pos -= 1;
            unsafe { std::ptr::write_volatile(dest_ptr.add(pos), byte); }
        }
    }

    // Zero remaining leading bytes (high-order padding)
    for i in 0..pos {
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

    let words: std::borrow::Cow<[u64]> = if num.sign_bit && !num.words.is_empty() {
        std::borrow::Cow::Owned(core::twos_complement(&num.words, width))
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

    // Zero remaining high bytes
    while pos < width {
        unsafe { std::ptr::write_volatile(dest_ptr.add(pos), 0); }
        pos += 1;
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_roundtrip_be() {
        let num = BigInt {
            sign_bit: false,
            words: vec![0x0102030405060708u64],
        };
        let mut buffer = vec![0u8; 8];
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
        let mut buffer = vec![0u8; 8];
        to_buffer_le_fast(num.clone(), &buffer);
        let recovered = to_bigint_le(&buffer);
        assert_eq!(recovered.words, num.words);
    }
}
