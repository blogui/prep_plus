/**
 * Checks if the src is inline SVG content (starts with <svg)
 */
export const isSvgContent = (src) => {
    if (!src || typeof src !== 'string') return false;
    return src.trim().toLowerCase().startsWith('<svg');
};

/**
 * Converts inline SVG content to a data URI
 */
export const svgToDataUri = (svgContent) => {
    try {
        // Encode the SVG content to create a data URI
        const encoded = encodeURIComponent(svgContent);
        return `data:image/svg+xml;utf8,${encoded}`;
    } catch (error) {
        console.error('Error converting SVG to data URI:', error);
        return null;
    }
};

/**
 * Converts an image source to displayable format
 * Handles both file URLs and inline SVG content
 */
export const getDisplayImageSrc = (src) => {
    if (!src || typeof src !== 'string') return null;
    if (isSvgContent(src)) {
        return svgToDataUri(src);
    }
    return src;
};
