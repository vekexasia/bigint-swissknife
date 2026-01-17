//! Core BigInt/buffer conversion algorithms.
//!
//! This crate provides the core conversion logic between BigInt word representations
//! (arrays of u64 in little-endian word order) and byte arrays (Uint8Array/Buffer).
//!
//! The algorithms are designed to be safe and handle edge cases properly, fixing
//! known issues from the original bigint-buffer library.

#![cfg_attr(not(feature = "std"), no_std)]

#[cfg(not(feature = "std"))]
extern crate alloc;

#[cfg(not(feature = "std"))]
use alloc::{vec, vec::Vec};

/// Convert big-endian bytes to BigInt words (u64 little-endian word order).
///
/// The output is an array of u64 values representing the BigInt in little-endian
/// word order (least significant word first), which is how JavaScript BigInt
/// stores its data internally.
///
/// # Arguments
/// * `bytes` - Big-endian byte array
///
/// # Returns
/// Vector of u64 words in little-endian order (LSW first)
///
/// # Examples
/// ```
/// use bigint_buffer2_core::be_bytes_to_words;
///
/// // 0x0102030405060708 as big-endian bytes
/// let bytes = [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08];
/// let words = be_bytes_to_words(&bytes);
/// assert_eq!(words, vec![0x0102030405060708u64]);
/// ```
#[inline(always)]
pub fn be_bytes_to_words(bytes: &[u8]) -> Vec<u64> {
    // Handle empty buffer - return empty words (represents 0n)
    if bytes.is_empty() {
        return Vec::new();
    }

    // Fast path: if first byte is non-zero, skip the leading zero scan
    let significant_bytes = if bytes[0] != 0 {
        bytes
    } else {
        let first_nonzero = bytes.iter().position(|&b| b != 0).unwrap_or(bytes.len());
        if first_nonzero == bytes.len() {
            return Vec::new();
        }
        &bytes[first_nonzero..]
    };

    let num_words = (significant_bytes.len() + 7) / 8;
    let mut words = Vec::with_capacity(num_words);

    // Process full 8-byte chunks from the end using direct u64 conversion (LSW first)
    let chunks = significant_bytes.rchunks_exact(8);
    let remainder = chunks.remainder();

    for chunk in chunks {
        // SAFETY: rchunks_exact guarantees exactly 8 bytes
        let word = u64::from_be_bytes(chunk.try_into().unwrap());
        words.push(word);
    }

    // Handle partial bytes at the beginning (MSW)
    if !remainder.is_empty() {
        let mut word = 0u64;
        for &byte in remainder {
            word = (word << 8) | (byte as u64);
        }
        words.push(word);
    }

    words
}

/// Convert little-endian bytes to BigInt words (u64 little-endian word order).
///
/// # Arguments
/// * `bytes` - Little-endian byte array
///
/// # Returns
/// Vector of u64 words in little-endian order (LSW first)
#[inline(always)]
pub fn le_bytes_to_words(bytes: &[u8]) -> Vec<u64> {
    // Handle empty buffer
    if bytes.is_empty() {
        return Vec::new();
    }

    // Fast path: if last byte is non-zero, skip the trailing zero scan
    let significant_bytes = if bytes[bytes.len() - 1] != 0 {
        bytes
    } else {
        // Only scan if last byte is zero
        let last_nonzero = bytes.iter().rposition(|&b| b != 0).map(|i| i + 1).unwrap_or(0);
        if last_nonzero == 0 {
            return Vec::new();
        }
        &bytes[..last_nonzero]
    };

    let num_words = (significant_bytes.len() + 7) / 8;
    let mut words = Vec::with_capacity(num_words);

    // Process full 8-byte chunks using direct u64 conversion (single load instruction)
    let chunks = significant_bytes.chunks_exact(8);
    let remainder = chunks.remainder();

    for chunk in chunks {
        // SAFETY: chunks_exact guarantees exactly 8 bytes
        let word = u64::from_le_bytes(chunk.try_into().unwrap());
        words.push(word);
    }

    // Handle remaining bytes (< 8)
    if !remainder.is_empty() {
        let mut word = 0u64;
        for (i, &byte) in remainder.iter().enumerate() {
            word |= (byte as u64) << (i * 8);
        }
        words.push(word);
    }

    words
}

/// Convert BigInt words to big-endian bytes with specified width.
///
/// # Arguments
/// * `words` - u64 words in little-endian order (LSW first)
/// * `width` - Desired output width in bytes
///
/// # Returns
/// Big-endian byte array of exactly `width` bytes
///
/// # Notes
/// - If `width` is 0, returns empty vector (fixes issue #40)
/// - If the value is too large for `width`, it will be truncated (high bytes removed)
#[inline]
pub fn words_to_be_bytes(words: &[u64], width: usize) -> Vec<u8> {
    let mut result = vec![0u8; width];
    words_to_be_bytes_into(words, &mut result);
    result
}

/// Convert BigInt words to little-endian bytes with specified width.
///
/// # Arguments
/// * `words` - u64 words in little-endian order (LSW first)
/// * `width` - Desired output width in bytes
///
/// # Returns
/// Little-endian byte array of exactly `width` bytes
#[inline]
pub fn words_to_le_bytes(words: &[u64], width: usize) -> Vec<u8> {
    let mut result = vec![0u8; width];
    words_to_le_bytes_into(words, &mut result);
    result
}

/// Convert BigInt words to big-endian bytes, writing into a pre-allocated buffer.
///
/// # Arguments
/// * `words` - u64 words in little-endian order (LSW first)
/// * `dest` - Destination buffer to write to (width is inferred from length)
///
/// # Notes
/// - If `dest` is empty, does nothing (fixes issue #40)
/// - If the value is too large for the buffer, it will be truncated
#[inline]
pub fn words_to_be_bytes_into(words: &[u64], dest: &mut [u8]) {
    let width = dest.len();

    // Handle edge cases
    if width == 0 {
        return;
    }

    // Zero the destination
    dest.fill(0);

    if words.is_empty() {
        return;
    }

    // Calculate how many full words fit and the offset
    let full_words = width / 8;
    let partial_bytes = width % 8;

    // Write full words from end (words are LSW-first, output is BE)
    let words_to_write = full_words.min(words.len());
    for i in 0..words_to_write {
        let word = words[i];
        let dest_start = width - (i + 1) * 8;
        dest[dest_start..dest_start + 8].copy_from_slice(&word.to_be_bytes());
    }

    // Handle partial word at the beginning (if width not divisible by 8)
    if partial_bytes > 0 && words_to_write < words.len() {
        let word = words[words_to_write];
        let word_bytes = word.to_be_bytes();
        // Copy the low bytes of this word to the beginning
        let src_start = 8 - partial_bytes;
        dest[0..partial_bytes].copy_from_slice(&word_bytes[src_start..]);
    }
}

/// Convert BigInt words to little-endian bytes, writing into a pre-allocated buffer.
///
/// # Arguments
/// * `words` - u64 words in little-endian order (LSW first)
/// * `dest` - Destination buffer to write to (width is inferred from length)
#[inline]
pub fn words_to_le_bytes_into(words: &[u64], dest: &mut [u8]) {
    let width = dest.len();

    // Handle edge cases
    if width == 0 {
        return;
    }

    // Zero the destination
    dest.fill(0);

    if words.is_empty() {
        return;
    }

    // Calculate how many full words fit
    let full_words = width / 8;
    let partial_bytes = width % 8;

    // Write full words (LE output, words are already LSW-first)
    let words_to_write = full_words.min(words.len());
    for i in 0..words_to_write {
        let word = words[i];
        let dest_start = i * 8;
        dest[dest_start..dest_start + 8].copy_from_slice(&word.to_le_bytes());
    }

    // Handle partial word at the end
    if partial_bytes > 0 && words_to_write < words.len() {
        let word = words[words_to_write];
        let word_bytes = word.to_le_bytes();
        let dest_start = words_to_write * 8;
        dest[dest_start..dest_start + partial_bytes].copy_from_slice(&word_bytes[..partial_bytes]);
    }
}

/// Calculate two's complement for negative numbers.
/// This converts a negative BigInt to its unsigned representation
/// for a given byte width.
pub fn twos_complement(words: &[u64], width: usize) -> Vec<u64> {
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
    fn test_be_bytes_to_words_empty() {
        assert_eq!(be_bytes_to_words(&[]), Vec::<u64>::new());
    }

    #[test]
    fn test_be_bytes_to_words_zero() {
        assert_eq!(be_bytes_to_words(&[0, 0, 0, 0]), Vec::<u64>::new());
    }

    #[test]
    fn test_be_bytes_to_words_single_byte() {
        assert_eq!(be_bytes_to_words(&[0x42]), vec![0x42u64]);
    }

    #[test]
    fn test_be_bytes_to_words_8_bytes() {
        let bytes = [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08];
        assert_eq!(be_bytes_to_words(&bytes), vec![0x0102030405060708u64]);
    }

    #[test]
    fn test_be_bytes_to_words_16_bytes() {
        let bytes = [
            0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
            0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10,
        ];
        // Words are in LSW-first order
        let expected = vec![0x090A0B0C0D0E0F10u64, 0x0102030405060708u64];
        assert_eq!(be_bytes_to_words(&bytes), expected);
    }

    #[test]
    fn test_le_bytes_to_words_empty() {
        assert_eq!(le_bytes_to_words(&[]), Vec::<u64>::new());
    }

    #[test]
    fn test_le_bytes_to_words_single_byte() {
        assert_eq!(le_bytes_to_words(&[0x42]), vec![0x42u64]);
    }

    #[test]
    fn test_le_bytes_to_words_8_bytes() {
        let bytes = [0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01];
        assert_eq!(le_bytes_to_words(&bytes), vec![0x0102030405060708u64]);
    }

    #[test]
    fn test_words_to_be_bytes_empty_width() {
        // Issue #40 - should not crash with width 0
        assert_eq!(words_to_be_bytes(&[0x1234], 0), Vec::<u8>::new());
    }

    #[test]
    fn test_words_to_be_bytes_zero_value() {
        assert_eq!(words_to_be_bytes(&[], 4), vec![0, 0, 0, 0]);
    }

    #[test]
    fn test_words_to_be_bytes_simple() {
        assert_eq!(words_to_be_bytes(&[0x0102030405060708], 8),
                   vec![0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
    }

    #[test]
    fn test_words_to_be_bytes_truncation() {
        // Value 0x123456 with width 2 should give 0x3456 (truncated)
        assert_eq!(words_to_be_bytes(&[0x123456], 2), vec![0x34, 0x56]);
    }

    #[test]
    fn test_words_to_le_bytes_empty_width() {
        assert_eq!(words_to_le_bytes(&[0x1234], 0), Vec::<u8>::new());
    }

    #[test]
    fn test_words_to_le_bytes_simple() {
        assert_eq!(words_to_le_bytes(&[0x0102030405060708], 8),
                   vec![0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01]);
    }

    #[test]
    fn test_roundtrip_be() {
        let original = vec![0xDEADBEEFCAFEBABEu64, 0x1234567890ABCDEFu64];
        let bytes = words_to_be_bytes(&original, 16);
        let recovered = be_bytes_to_words(&bytes);
        assert_eq!(recovered, original);
    }

    #[test]
    fn test_roundtrip_le() {
        let original = vec![0xDEADBEEFCAFEBABEu64, 0x1234567890ABCDEFu64];
        let bytes = words_to_le_bytes(&original, 16);
        let recovered = le_bytes_to_words(&bytes);
        assert_eq!(recovered, original);
    }
}
