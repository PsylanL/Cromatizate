# Cromatizate

**Cromatizate** is an academic project that improves visual accessibility for people with color vision deficiencies (color blindness) through image processing, semantic metadata generation (JSON-LD), and the selective use of AI models.

## 1. Project Introduction

### What is Cromatizate?
Cromatizate is a web application that allows users to upload images and visualize how they would look adapted for different types of color blindness. The system automatically generates semantic metadata in JSON-LD format describing the images and their adaptations, contributing to web accessibility and semantic web principles.

### Problem it Solves
Color blindness affects approximately 8% of men and 0.5% of women worldwide. People with color vision deficiencies may struggle to distinguish certain colors in images, limiting their ability to access and understand visual content on the web.

Cromatizate addresses this problem through:
- **Visual simulation** of different types of color blindness using CSS filters.
- **Automatic generation of descriptions** for images using AI.
- **Semantic metadata** in JSON-LD format that describes the adaptations.

### Target Users
- People with different types of color blindness (protanopia, deuteranopia, tritanopia, and their variants).
- Web developers interested in improving their sites' accessibility.
- Researchers and students in the field of web accessibility and semantic web.

### Academic Context
This project was developed as part of academic work on **Semantic Web and Accessibility**. The goal is to demonstrate the practical application of theoretical concepts such as:
- Structured metadata (JSON-LD)
- Semantic vocabularies (Schema.org)
- Image processing with AI
- Semantic agent architectures

---

## 2. Core Functionalities

### 2.1. Image Uploading
The system allows uploading images in two ways:
- **File Upload**: The user can select an image file from their device.
- **URL**: The user can paste a URL of an online image.
*Implementation: `components/adaptador/AdapterPanel.tsx`*

### 2.2. Visual Simulation of Color Blindness
The system applies CSS filters to simulate different types of color blindness:
- **Protanopia / Protanomaly**: Red color deficiency.
- **Deuteranopia / Deuteranomaly**: Green color deficiency.
- **Tritanopia / Tritanomaly**: Blue color deficiency.
- **Achromatopsia**: Total color blindness (grayscale).

### 2.3. Before/After Comparison
Users can toggle between a side-by-side comparison view or a single view of the adapted image.

### 2.4. Automatic JSON-LD Metadata Generation
The system generates metadata following the **Schema.org** standard, including:
- `@type: "ImageObject"`
- Content URL and Description
- Accessibility features and adaptations applied
- Creator and Modification dates

### 2.5. AI Description Generation
When an image is loaded, the system calls an AI agent to generate a textual description.
- **Model**: Salesforce BLIP-2 (via Replicate API).
- **Endpoint**: `/api/agents/caption`

---

## 3. System Architecture

### Frontend
- **Framework**: Next.js 16.0.8 / React 19.2.1
- **Logic**: Image processing and JSON-LD generation are executed entirely on the **client-side** (browser).

### AI Agents
Although designed for a multi-agent architecture, currently the **Image Captioning Agent** is active:
- ✅ **Status**: Active and Functional
- **Provider**: Replicate API
- **Fallback**: If the API fails, the system uses a default description based on the adaptation type.

---

## 4. Database & Storage

### Schema
The project uses **Prisma** as the ORM and **Supabase (PostgreSQL)** for data persistence.
- **File**: `prisma/schema.prisma`

---

## 5. JSON-LD and Accessibility

### Example of Generated Metadata
```json
{
  "@context": "[https://schema.org](https://schema.org)",
  "@type": "ImageObject",
  "name": "landscape.jpg",
  "contentUrl": "data:image/jpeg;base64,...",
  "description": "A colorful landscape with flowers and trees",
  "accessibilityFeature": [
    "colorAdaptation",
    "deuteranopiaSimulation"
  ],
  "accessibilityHazard": "none",
  "inLanguage": "en",
  "creator": {
    "@type": "Organization",
    "name": "Cromatizate"
  }
}
```
## 6. Installation and Configuration

### Requirements
* **Node.js**: Version 18 or higher
* **npm** or **yarn**: Package manager
* **Replicate Account** (Optional): For AI-driven image descriptions
* **Supabase Account** (Optional): For cloud-based preference persistence

### Environment Variables
Create a `.env.local` file in the root directory of the project:

```env
# Supabase (Optional - only if using database storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_public_key
```
# Replicate API (Optional - only for AI descriptions)
REPLICATE_API_TOKEN=your_replicate_token

### Commands

```bash
# Install project dependencies
npm install

# Run the application in development mode
npm run dev

# Build the application for production
npm run build

# Start the production server
npm start

# Run the linter
npm run lint
