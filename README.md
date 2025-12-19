# Cromatizate

**Cromatizate** is an academic project that improves visual accessibility for people with color vision deficiencies (color blindness) through image processing, semantic metadata generation (JSON-LD), and selective use of AI models.

## 1. Project Introduction

### What is Cromatizate?

Cromatizate is a web application that allows users to upload images and visualize how they would appear when adapted for different types of color blindness. The system automatically generates semantic metadata in JSON-LD format that describes the images and their adaptations, contributing to web accessibility and semantic web principles.

### Problem It Solves

Color blindness affects approximately 8% of men and 0.5% of women worldwide. People with color vision deficiencies may have difficulty distinguishing certain colors in images, which limits their ability to access and understand visual content on the web.

Cromatizate addresses this problem through:
- **Visual simulation** of different types of color blindness using CSS filters
- **Automatic image description generation** using AI
- **Semantic metadata** in JSON-LD format describing the adaptations

### Target Users

- People with different types of color blindness (protanopia, deuteranopia, tritanopia, and their variants)
- Web developers interested in improving the accessibility of their websites
- Researchers and students in the fields of web accessibility and the semantic web

### Academic Context

This project was developed as part of an academic assignment on **Semantic Web and Accessibility**. Its goal is to demonstrate the practical application of theoretical concepts such as:
- Structured metadata (JSON-LD)
- Semantic vocabularies (Schema.org)
- AI-based image processing
- Semantic agent architectures

## 2. Core Features (Actually Implemented Features)

### 2.1. Image Upload

The system allows images to be uploaded in two ways:
- **File upload**: The user can select an image file from their device
- **URL**: The user can paste a URL of an online image

**Implementation**: `components/adaptador/AdapterPanel.tsx` – Functions `handleFileUpload()` and `handleUrlSubmit()`

### 2.2. Visual Simulation of Color Blindness

The system applies CSS filters to simulate how an image would look for different types of color blindness:
- **Protanopia**: Difficulty perceiving red
- **Deuteranopia**: Difficulty perceiving green
- **Tritanopia**: Difficulty perceiving blue
- **Protanomaly**: Reduced sensitivity to red
- **Deuteranomaly**: Reduced sensitivity to green
- **Tritanomaly**: Reduced sensitivity to blue
- **Achromatopsia**: Total inability to perceive color (grayscale)

**Implementation**: `components/adaptador/AdapterPanel.tsx` – Function `getAdaptationFilter()` which applies `hue-rotate()` and `grayscale()` transformations based on the selected type.

### 2.3. Before/After Comparison

The user can switch between:
- **Comparison view**: Shows the original and adapted images side by side
- **Single view**: Shows only the adapted image

**Implementation**: `components/adaptador/AdapterPanel.tsx` – `showComparison` state and conditional rendering.

### 2.4. Automatic JSON-LD Metadata Generation

The system automatically generates metadata in JSON-LD format following the Schema.org standard. The metadata includes:
- Object type (`@type: "ImageObject"`)
- Content URL
- Image description (AI-generated or default)
- Accessibility features (`accessibilityFeature`)
- Type of adaptation applied
- Creator information
- Modification date

**Implementation**: `components/adaptador/AdapterPanel.tsx` – `useMemo` hook that generates `jsonLd` based on the uploaded image, adaptation type, and AI description.

**Example of generated JSON-LD**:
```json
{
  "@context": "https://schema.org",
  "@type": "ImageObject",
  "name": "imagen.jpg",
  "contentUrl": "data:image/jpeg;base64,...",
  "image": "data:image/jpeg;base64,...",
  "representativeOfPage": true,
  "description": "A colorful landscape with flowers and trees",
  "accessibilityFeature": [
    "colorAdaptation",
    "deuteranopiaSimulation"
  ],
  "accessibilityHazard": "none",
  "inLanguage": "es",
  "creator": {
    "@type": "Organization",
    "name": "Cromatizate"
  },
  "dateModified": "2024-12-09T12:00:00.000Z",
  "aiGeneratedDescription": "A colorful landscape with flowers and trees"
}
