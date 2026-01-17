//! WASM bindings for BigInt/buffer conversion using wasm-bindgen.
//!
//! This crate exposes the core conversion algorithms to browsers via WebAssembly,
//! providing high-performance BigInt/Uint8Array conversion.

use wasm_bindgen::prelude::*;
use js_sys::{BigInt as JsBigInt, Uint8Array};
use bigint_buffer2_core as core;

extern crate alloc;
use alloc::vec::Vec;

// Import JavaScript BigInt operations for efficient conversion
#[wasm_bindgen(inline_js = r#"
// Convert u64 words array (little-endian order) to BigInt
export function wordsToJsBigint(words) {
    if (!words || words.length === 0) return 0n;
    let result = 0n;
    for (let i = words.length - 1; i >= 0; i--) {
        result = (result << 64n) | words[i];
    }
    return result;
}

// Convert BigInt to u64 words array (little-endian order)
// Returns [words_array, is_negative]
export function jsBigintToWords(num) {
    if (num === 0n) return [new BigUint64Array(0), false];
    const isNegative = num < 0n;
    let abs = isNegative ? -num : num;
    const words = [];
    const mask = 0xffffffffffffffffn;
    while (abs > 0n) {
        words.push(abs & mask);
        abs >>= 64n;
    }
    return [new BigUint64Array(words), isNegative];
}
"#)]
extern "C" {
    #[wasm_bindgen(js_name = wordsToJsBigint)]
    fn words_to_js_bigint_js(words: &[u64]) -> JsBigInt;

    #[wasm_bindgen(js_name = jsBigintToWords)]
    fn js_bigint_to_words_js(num: &JsBigInt) -> JsValue;
}

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
        core::twos_complement(&words, width as usize)
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
        core::twos_complement(&words, width as usize)
    } else {
        words
    };

    let bytes = core::words_to_le_bytes(&final_words, width as usize);
    Uint8Array::from(&bytes[..])
}

/// Convert a BigInt to big-endian bytes, writing into a provided Uint8Array.
///
/// # Arguments
/// * `num` - BigInt value
/// * `buffer` - Pre-allocated Uint8Array to write into
#[wasm_bindgen]
pub fn to_buffer_be_into(num: &JsBigInt, buffer: &Uint8Array) {
    let width = buffer.length() as usize;
    if width == 0 {
        return;
    }

    let (words, is_negative) = js_bigint_to_words(num);

    let final_words = if is_negative && !words.is_empty() {
        core::twos_complement(&words, width)
    } else {
        words
    };

    let bytes = core::words_to_be_bytes(&final_words, width);
    buffer.copy_from(&bytes);
}

/// Convert a BigInt to little-endian bytes, writing into a provided Uint8Array.
///
/// # Arguments
/// * `num` - BigInt value
/// * `buffer` - Pre-allocated Uint8Array to write into
#[wasm_bindgen]
pub fn to_buffer_le_into(num: &JsBigInt, buffer: &Uint8Array) {
    let width = buffer.length() as usize;
    if width == 0 {
        return;
    }

    let (words, is_negative) = js_bigint_to_words(num);

    let final_words = if is_negative && !words.is_empty() {
        core::twos_complement(&words, width)
    } else {
        words
    };

    let bytes = core::words_to_le_bytes(&final_words, width);
    buffer.copy_from(&bytes);
}

/// Convert u64 words to JavaScript BigInt using native BigInt operations.
///
/// Uses direct BigInt shift/OR operations instead of hex string intermediary.
#[inline]
fn words_to_js_bigint(words: &[u64]) -> JsBigInt {
    if words.is_empty() {
        return JsBigInt::from(0i64);
    }
    words_to_js_bigint_js(words)
}

/// Convert JavaScript BigInt to u64 words using native BigInt operations.
///
/// Returns (words, is_negative) tuple.
#[inline]
fn js_bigint_to_words(num: &JsBigInt) -> (Vec<u64>, bool) {
    use js_sys::{Array, BigUint64Array};

    let result = js_bigint_to_words_js(num);

    // Result is [BigUint64Array, boolean]
    let arr = Array::from(&result);
    if arr.length() < 2 {
        return (Vec::new(), false);
    }

    let words_arr = arr.get(0);
    let is_negative = arr.get(1).as_bool().unwrap_or(false);

    // Convert BigUint64Array to Vec<u64>
    let typed_arr = BigUint64Array::from(words_arr);
    let len = typed_arr.length() as usize;
    let mut words = vec![0u64; len];
    typed_arr.copy_to(&mut words);

    (words, is_negative)
}

