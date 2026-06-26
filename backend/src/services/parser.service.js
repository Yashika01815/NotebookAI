import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export const parseDocument = async (filePath, fileType) => {
  const absolutePath = path.resolve(filePath);
  
  try {
    switch (fileType) {
      case 'pdf':
        return await parsePDF(absolutePath);
      case 'docx':
        return await parseDOCX(absolutePath);
      case 'txt':
        return await parseTXT(absolutePath);
      case 'md':
        return await parseMD(absolutePath);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    throw new Error(`Failed to parse ${fileType} file: ${error.message}`);
  }
};

const parsePDF = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  const data = await pdfParse(buffer);
  
  return {
    content: data.text,
    metadata: {
      pageCount: data.numpages,
      wordCount: data.text.split(/\s+/).filter(Boolean).length,
      author: data.info?.Author || null,
    },
  };
};

const parseDOCX = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  const result = await mammoth.extractRawText({ buffer });
  
  return {
    content: result.value,
    metadata: {
      wordCount: result.value.split(/\s+/).filter(Boolean).length,
    },
  };
};

const parseTXT = async (filePath) => {
  const content = await fs.readFile(filePath, 'utf-8');
  return {
    content,
    metadata: {
      wordCount: content.split(/\s+/).filter(Boolean).length,
    },
  };
};

const parseMD = async (filePath) => {
  const content = await fs.readFile(filePath, 'utf-8');
  // Strip markdown syntax for indexing
  const plainText = content
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '');
  
  return {
    content: plainText,
    metadata: {
      wordCount: plainText.split(/\s+/).filter(Boolean).length,
    },
  };
};
