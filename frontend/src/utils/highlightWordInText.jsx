import React from 'react';

// structureExtractedText(text, highlightWord)
// Processes and structures OCR text for better readability
// - text: string containing the OCR/extracted text
// - highlightWord: the word to highlight (string or null)
// Returns structured React components suitable for rendering
export default function structureExtractedText(text, highlightWord) {
	if (!text) return null;

	// Clean up the text and handle common OCR issues
	const cleanText = text
		.replace(/(\r\n|\n|\r)/gm, '\n') // Normalize line endings
		.replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
		.trim();

	if (!cleanText) return <em style={{ color: 'var(--gray-500)' }}>No text detected</em>;

	// Split into paragraphs
	const paragraphs = cleanText.split('\n\n').filter(p => p.trim());

	if (paragraphs.length === 0) return <em style={{ color: 'var(--gray-500)' }}>No text detected</em>;

	return paragraphs.map((paragraph, paraIndex) => {
		// Process lines within each paragraph
		const lines = paragraph.split('\n').filter(line => line.trim());

		return (
			<div key={paraIndex} style={{ marginBottom: '1.25rem' }}>
				{lines.map((line, lineIndex) => (
					<div key={lineIndex} style={{
						marginBottom: '0.5rem',
						lineHeight: '1.6',
						paddingLeft: lines.length > 1 ? '1rem' : '0',
						borderLeft: lines.length > 1 ? '3px solid var(--gray-200)' : 'none',
						paddingTop: lineIndex === 0 ? '0' : '0.25rem'
					}}>
						{highlightWord ? renderLineWithHighlight(line, highlightWord) : line}
					</div>
				))}

				{/* Paragraph separator */}
				{paraIndex < paragraphs.length - 1 && (
					<hr style={{
						border: 'none',
						height: '1px',
						background: 'var(--gray-100)',
						margin: '1.5rem 0'
					}} />
				)}
			</div>
		);
	});
}

// Helper function to render line with highlighting
function renderLineWithHighlight(line, highlightWord) {
	if (!highlightWord) return line;

	// Escape regex special chars from the word
	const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const escaped = escapeRegExp(highlightWord);
	const re = new RegExp(`(${escaped})`, 'gi');

	const parts = line.split(re);

	return parts.map((part, idx) => {
		if (part.toLowerCase() === highlightWord.toLowerCase()) {
			return (
				<mark
					key={idx}
					style={{
						background: 'linear-gradient(135deg, rgba(255, 204, 0, 0.91), rgba(255, 255, 0, 1))',
						padding: '0 4px',
						borderRadius: 4,
						fontWeight: 700,
						color: 'inherit'
					}}
				>
					{part}
				</mark>
			);
		}
		return part;
	});
}
