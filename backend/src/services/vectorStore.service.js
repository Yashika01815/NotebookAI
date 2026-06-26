import { ChromaClient } from 'chromadb';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document as LangchainDoc } from 'langchain/document';

let chromaClient = null;
let embeddingsModel = null;

export const getChromaClient = () => {
  if (!chromaClient) {
    chromaClient = new ChromaClient({ path: process.env.CHROMA_URL || 'http://localhost:8000' });
  }
  return chromaClient;
};

export const getEmbeddings = () => {
  if (!embeddingsModel) {
    embeddingsModel = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: 'embedding-001',
    });
  }
  return embeddingsModel;
};

export const getTextSplitter = () => {
  return new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ['\n\n', '\n', '. ', '! ', '? ', ' ', ''],
  });
};

export const indexDocument = async (collectionName, documentId, documentName, content) => {
  const textSplitter = getTextSplitter();
  const chunks = await textSplitter.splitText(content);

  if (chunks.length === 0) {
    throw new Error('No content to index');
  }

  const docs = chunks.map((chunk, i) => new LangchainDoc({
    pageContent: chunk,
    metadata: {
      documentId,
      documentName,
      chunkIndex: i,
      totalChunks: chunks.length,
    },
  }));

  const embeddings = getEmbeddings();

  const vectorStore = await Chroma.fromDocuments(docs, embeddings, {
    collectionName,
    url: process.env.CHROMA_URL || 'http://localhost:8000',
  });

  return { chunksIndexed: chunks.length, vectorStore };
};

export const getVectorStore = async (collectionName) => {
  const embeddings = getEmbeddings();
  return new Chroma(embeddings, {
    collectionName,
    url: process.env.CHROMA_URL || 'http://localhost:8000',
  });
};

export const similaritySearch = async (collectionName, query, k = 5, filter = null) => {
  const vectorStore = await getVectorStore(collectionName);
  const searchOptions = { k };
  if (filter) searchOptions.filter = filter;

  const results = await vectorStore.similaritySearchWithScore(query, k);
  return results.map(([doc, score]) => ({
    content: doc.pageContent,
    metadata: doc.metadata,
    score,
  }));
};

export const deleteDocumentFromChroma = async (collectionName, documentId) => {
  try {
    const client = getChromaClient();
    const collection = await client.getCollection({ name: collectionName });
    await collection.delete({ where: { documentId } });
  } catch (error) {
    console.warn('Error deleting from ChromaDB:', error.message);
  }
};

export const deleteChromaCollection = async (collectionName) => {
  try {
    const client = getChromaClient();
    await client.deleteCollection({ name: collectionName });
  } catch (error) {
    console.warn('Error deleting ChromaDB collection:', error.message);
  }
};

export const getCollectionStats = async (collectionName) => {
  try {
    const client = getChromaClient();
    const collection = await client.getCollection({ name: collectionName });
    const count = await collection.count();
    return { count };
  } catch {
    return { count: 0 };
  }
};
