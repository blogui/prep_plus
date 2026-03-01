import React, { useState, useCallback } from 'react';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Returns true only when src is a non-empty string that looks like a URL.
 * Deliberately conservative — unknown / relative paths are treated as valid
 * and allowed to fail through onError instead.
 */
const isValidImageSrc = (src) => {
    if (!src || typeof src !== 'string') return false;
    const trimmed = src.trim();
    if (trimmed === '') return false;
    return true; // let the browser decide; onError handles real failures
};

// ─────────────────────────────────────────────
// QuestionImage — with fallback on load error
// ─────────────────────────────────────────────
const QuestionImage = ({ src, alt = 'Question image' }) => {
    const [hidden, setHidden] = useState(false);

    if (!isValidImageSrc(src) || hidden) return null;

    return (
        <div className="flex justify-center mt-4">
            <img
                src={src}
                alt={alt}
                onError={() => setHidden(true)}
                style={{
                    maxHeight: '220px',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                }}
            />
        </div>
    );
};

// ─────────────────────────────────────────────
// OptionImage — with fallback on load error
// ─────────────────────────────────────────────
const OptionImage = ({ src, alt = 'Option image' }) => {
    const [hidden, setHidden] = useState(false);

    if (!isValidImageSrc(src) || hidden) return null;

    return (
        <div className="flex justify-center mt-2">
            <img
                src={src}
                alt={alt}
                onError={() => setHidden(true)}
                style={{
                    maxHeight: '120px',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                }}
            />
        </div>
    );
};

// ─────────────────────────────────────────────
// OptionCard — single selectable option
// ─────────────────────────────────────────────
const OptionCard = ({ option, index, questionId, isSelected, onSelect }) => {
    const hasText = Boolean(option.text?.trim());
    const hasImage = isValidImageSrc(option.image);
    const label = String.fromCharCode(65 + index); // A, B, C, D …

    return (
        <label
            htmlFor={`option-${questionId}-${index}`}
            className={`flex items-start gap-3 p-4 rounded-[10px] border cursor-pointer
        transition-all duration-150 select-none
        ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-[#e5e5e5] bg-white hover:border-blue-300 hover:bg-gray-50'
                }`}
            style={{ minHeight: '56px' }}
        >
            {/* Hidden radio for accessibility */}
            <input
                id={`option-${questionId}-${index}`}
                type="radio"
                name={`question-${questionId}`}
                value={index}
                checked={isSelected}
                onChange={() => onSelect(questionId, index)}
                className="sr-only"
            />

            {/* Radio bubble */}
            <div
                className={`mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center
          transition-colors
          ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'}`}
            >
                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Option letter badge */}
                <span className={`text-xs font-bold mr-1 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                    {label}.
                </span>

                {/* Text */}
                {hasText && (
                    <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                        {option.text}
                    </span>
                )}

                {/* Image */}
                {hasImage && <OptionImage src={option.image} alt={`Option ${label}`} />}

                {/* Fallback */}
                {!hasText && !hasImage && (
                    <span className="text-sm text-gray-400 italic">Content not available</span>
                )}
            </div>
        </label>
    );
};

// ─────────────────────────────────────────────
// QuestionCard — main exported component
// ─────────────────────────────────────────────

/**
 * Props:
 *   questionData  – { id, question, questionImage, options: [{ text, image }], marks }
 *   questionIndex – 0-based index (for display)
 *   selectedAnswer – currently selected option index (or undefined)
 *   onAnswerSelect – (questionId, optionIndex) => void
 */
const QuestionCard = ({ questionData, questionIndex, selectedAnswer, onAnswerSelect }) => {
    const { id, question, questionImage, options = [], marks = 1 } = questionData;

    const hasQuestionText = Boolean(question?.trim());
    const hasQuestionImage = isValidImageSrc(questionImage);

    const handleSelect = useCallback(
        (questionId, optionIndex) => onAnswerSelect(questionId, optionIndex),
        [onAnswerSelect]
    );

    return (
        <div
            className="bg-white rounded-[12px] shadow-sm border p-5"
            style={{ minHeight: '300px' }}
        >
            {/* ── Question header ── */}
            <div className="flex items-center gap-2 mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Q {questionIndex + 1}
                </span>
                <span className="text-sm text-gray-500">{marks} {marks === 1 ? 'mark' : 'marks'}</span>
            </div>

            {/* ── Question body ── */}
            <div className="mb-6 text-center">
                {hasQuestionText && (
                    <p className="text-base font-semibold text-gray-900 leading-relaxed">
                        {question}
                    </p>
                )}

                {hasQuestionImage && (
                    <QuestionImage src={questionImage} alt={`Question ${questionIndex + 1} image`} />
                )}

                {!hasQuestionText && !hasQuestionImage && (
                    <p className="text-gray-400 italic">Content not available</p>
                )}
            </div>

            {/* ── Options ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {options.map((option, idx) => (
                    <OptionCard
                        key={idx}
                        option={option}
                        index={idx}
                        questionId={id}
                        isSelected={selectedAnswer === idx}
                        onSelect={handleSelect}
                    />
                ))}
            </div>
        </div>
    );
};

export default QuestionCard;
