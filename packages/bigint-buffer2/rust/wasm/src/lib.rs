//! WASM bindings for BigInt/buffer conversion using wasm-bindgen.
//!
//! This crate exposes the core conversion algorithms to browsers via WebAssembly,
//! providing high-performance BigInt/Uint8Array conversion.

use wasm_bindgen::prelude::*;
use js_sys::{BigInt as JsBigInt, Uint8Array};
use bigint_buffer2_core as core;

extern crate alloc;
use alloc::vec::Vec;

/// Convert a big-endian Uint8Array to BigInt.
///
/// # Arguments
/// * `buffer` - Big-endian byte array
///
/// # Returns
/// BigInt value
#[wasm_bindgen]
pub fn to_bigint_be(buffer: &Uint8Array) -> JsBigInt {
    let bytes = buffer.to_vec();

    if bytes.is_empty() {
        return JsBigInt::from(0i64);
    }

    let words = core::be_bytes_to_words(&bytes);

    if words.is_empty() {
        return JsBigInt::from(0i64);
    }

    words_to_js_bigint(&words)
}

/// Convert a little-endian Uint8Array to BigInt.
///
/// # Arguments
/// * `buffer` - Little-endian byte array
///
/// # Returns
/// BigInt value
#[wasm_bindgen]
pub fn to_bigint_le(buffer: &Uint8Array) -> JsBigInt {
    let bytes = buffer.to_vec();

    if bytes.is_empty() {
        return JsBigInt::from(0i64);
    }

    let words = core::le_bytes_to_words(&bytes);

    if words.is_empty() {
        return JsBigInt::from(0i64);
    }

    words_to_js_bigint(&words)
}

/// Convert a BigInt to big-endian Uint8Array with specified width.
///
/// # Arguments
/// * `num` - BigInt value (as JsValue)
/// * `width` - Desired array width in bytes
///
/// # Returns
/// Big-endian Uint8Array of exactly `width` bytes
#[wasm_bindgen]
pub fn to_buffer_be(num: &JsBigInt, width: u32) -> Uint8Array {
    if width == 0 {
        return Uint8Array::new_with_length(0);
    }

    let (words, is_negative) = js_bigint_to_words(num);

    let final_words = if is_negative && !words.is_empty() {
        twos_complement(&words, width as usize)
    } else {
        words
    };

    let bytes = core::words_to_be_bytes(&final_words, width as usize);
    Uint8Array::from(&bytes[..])
}

/// Convert a BigInt to little-endian Uint8Array with specified width.
///
/// # Arguments
/// * `num` - BigInt value (as JsValue)
/// * `width` - Desired array width in bytes
///
/// # Returns
/// Little-endian Uint8Array of exactly `width` bytes
#[wasm_bindgen]
pub fn to_buffer_le(num: &JsBigInt, width: u32) -> Uint8Array {
    if width == 0 {
        return Uint8Array::new_with_length(0);
    }

    let (words, is_negative) = js_bigint_to_words(num);

    let final_words = if is_negative && !words.is_empty() {
        twos_complement(&words, width as usize)
    } else {
        words
    };

    let bytes = core::words_to_le_bytes(&final_words, width as usize);
    Uint8Array::from(&bytes[..])
}

/// Convert u64 words to JavaScript BigInt.
///
/// We construct the BigInt by building it from hex string representation,
/// which is more reliable than trying to use BigInt operations directly.
fn words_to_js_bigint(words: &[u64]) -> JsBigInt {
    if words.is_empty() {
        return JsBigInt::from(0i64);
    }

    // Build hex string from most significant to least significant
    let mut hex = String::with_capacity(words.len() * 16 + 2);
    hex.push_str("0x");

    let mut leading = true;
    for &word in words.iter().rev() {
        if leading {
            if word == 0 {
                continue;
            }
            // First non-zero word - don't pad with zeros
            hex.push_str(&format!("{:x}", word));
            leading = false;
        } else {
            // Subsequent words - pad to 16 hex digits
            hex.push_str(&format!("{:016x}", word));
        }
    }

    if leading {
        // All zeros
        return JsBigInt::from(0i64);
    }

    // Parse the hex string as BigInt
    JsBigInt::new(&JsValue::from_str(&hex)).unwrap_or_else(|_| JsBigInt::from(0i64))
}

/// Convert JavaScript BigInt to u64 words.
///
/// Returns (words, is_negative) tuple.
fn js_bigint_to_words(num: &JsBigInt) -> (Vec<u64>, bool) {
    // Convert to string and parse
    // This is the most reliable way to extract the value
    let s = num.to_string(16)
        .map(|v| v.as_string().unwrap_or_default())
        .unwrap_or_default();

    if s.is_empty() || s == "0" {
        return (Vec::new(), false);
    }

    let is_negative = s.starts_with('-');
    let hex_str = if is_negative {
        &s[1..] // Skip the minus sign
    } else {
        &s[..]
    };

    // Parse hex string into words
    let mut words = Vec::new();

    // Process from right to left, 16 hex chars (64 bits) at a time
    let chars: Vec<char> = hex_str.chars().collect();
    let len = chars.len();

    let mut pos = len;
    while pos > 0 {
        let start = if pos >= 16 { pos - 16 } else { 0 };
        let chunk: String = chars[start..pos].iter().collect();
        let word = u64::from_str_radix(&chunk, 16).unwrap_or(0);
        words.push(word);
        pos = start;
    }

    (words, is_negative)
}

/// Calculate two's complement for negative numbers.
fn twos_complement(words: &[u64], width: usize) -> Vec<u64> {
    if words.is_empty() || width == 0 {
        return Vec::new();
    }

    let num_words = (width + 7) / 8;
    let mut result = alloc::vec![0u64; num_words];

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
