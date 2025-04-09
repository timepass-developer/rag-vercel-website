import type { Media, User } from '@/payload-types'
import { RequiredDataFromCollectionSlug } from 'payload'

export type PostArgs = {
  heroImage: Media
  blockImage: Media
  author: User
}

export const post1: (args: PostArgs) => RequiredDataFromCollectionSlug<'posts'> = ({
  heroImage,
  blockImage,
  author,
}) => {
  return {
    slug: 'rag-applications-transforming-ai',
    _status: 'published',
    authors: [author],
    content: {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Dive into the world of Retrieval-Augmented Generation, where AI answers are grounded in real data. A journey where knowledge bases and language models converge to create more accurate and reliable responses.',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h2',
            version: 1,
          },
          {
            type: 'block',
            fields: {
              blockName: 'Disclaimer',
              blockType: 'banner',
              content: {
                root: {
                  type: 'root',
                  children: [
                    {
                      type: 'paragraph',
                      children: [
                        {
                          type: 'text',
                          detail: 0,
                          format: 1,
                          mode: 'normal',
                          style: '',
                          text: 'Disclaimer:',
                          version: 1,
                        },
                        {
                          type: 'text',
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: ' This article explores RAG technology. To create your own RAG application, ',
                          version: 1,
                        },
                        {
                          type: 'link',
                          children: [
                            {
                              type: 'text',
                              detail: 0,
                              format: 0,
                              mode: 'normal',
                              style: '',
                              text: 'visit our RAG builder',
                              version: 1,
                            },
                          ],
                          direction: 'ltr',
                          fields: {
                            linkType: 'custom',
                            newTab: true,
                            url: '/rag-admin',
                          },
                          format: '',
                          indent: 0,
                          version: 3,
                        },
                        {
                          type: 'text',
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: '.',
                          version: 1,
                        },
                      ],
                      direction: 'ltr',
                      format: '',
                      indent: 0,
                      textFormat: 0,
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  version: 1,
                },
              },
              style: 'info',
            },
            format: '',
            version: 2,
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Understanding RAG: Bridging Knowledge and AI',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h2',
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Retrieval-Augmented Generation (RAG) represents a paradigm shift in how AI systems respond to queries. Unlike traditional language models that rely solely on patterns learned during training, RAG systems actively retrieve relevant information from external knowledge sources before generating responses. This approach grounds AI outputs in factual data, significantly reducing hallucinations and inaccuracies that plague conventional models. By combining the power of information retrieval with generative capabilities, RAG creates more trustworthy AI systems that can cite their sources and provide evidence-based answers across various domains from customer support to medical research.',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Here is a simplified example of a RAG implementation in Python:',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h4',
            version: 1,
          },
          {
            type: 'code',
            language: 'python',
            code: "from langchain.vectorstores import Chroma\nfrom langchain.embeddings import OpenAIEmbeddings\nfrom langchain.text_splitter import RecursiveCharacterTextSplitter\nfrom langchain.llms import OpenAI\nfrom langchain.chains import RetrievalQA\nfrom langchain.document_loaders import TextLoader\n\n# Load document\nloader = TextLoader('knowledge_base.txt')\ndocuments = loader.load()\n\n# Split into chunks\ntext_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)\ntexts = text_splitter.split_documents(documents)\n\n# Create vector store\nembeddings = OpenAIEmbeddings()\nvector_db = Chroma.from_documents(texts, embeddings)\n\n# Create RAG chain\nretrievar = vector_db.as_retriever(search_kwargs={'k': 3})\nrag_chain = RetrievalQA.from_chain_type(\n    llm=OpenAI(),\n    chain_type='stuff',\n    retriever=retrievar\n)\n\n# Query the system\nresponse = rag_chain.run('What are the key benefits of RAG applications?')\nprint(response)\n",
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Key Components of Effective RAG Systems',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h2',
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Building an effective RAG application requires careful consideration of multiple components. At its core, a RAG system needs a robust document processing pipeline that can ingest, chunk, and index various document formats including PDFs, Word documents, and web pages. These documents are then processed into vector embeddings - mathematical representations that capture semantic meaning - enabling the system to quickly find relevant information when a query arrives. The retrieval mechanism must be optimized to balance recall (finding all relevant information) with precision (avoiding irrelevant content), while the generation component needs to synthesize retrieved information into coherent, accurate responses that properly attribute sources.',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: 'block',
            fields: {
              blockName: '',
              blockType: 'mediaBlock',
              media: blockImage.id,
            },
            format: '',
            version: 2,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: "With our RAG Builder platform, you can create these sophisticated systems without writing a single line of code. Our visual workflow editor allows you to design your RAG application's document processing pipeline, configure vector storage, and connect to leading AI models through a simple interface. Whether you're building a knowledge base for customer support, enhancing research capabilities, or creating an intelligent document assistant, our platform streamlines the entire process from upload to deployment.",
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: 'block',
            fields: {
              blockName: 'Start Building',
              blockType: 'banner',
              content: {
                root: {
                  type: 'root',
                  children: [
                    {
                      type: 'paragraph',
                      children: [
                        {
                          type: 'text',
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: 'Ready to create your own RAG application? Visit our ',
                          version: 1,
                        },
                        {
                          type: 'link',
                          children: [
                            {
                              type: 'text',
                              detail: 0,
                              format: 0,
                              mode: 'normal',
                              style: '',
                              text: 'RAG Builder platform',
                              version: 1,
                            },
                          ],
                          direction: 'ltr',
                          fields: {
                            linkType: 'custom',
                            newTab: false,
                            url: '/rag-admin',
                          },
                          format: '',
                          indent: 0,
                          version: 2,
                        },
                        {
                          type: 'text',
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: ' to get started with our visual workflow editor. No coding required.',
                          version: 1,
                        },
                      ],
                      direction: 'ltr',
                      format: '',
                      indent: 0,
                      textFormat: 0,
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  version: 1,
                },
              },
              style: 'success',
            },
            format: '',
            version: 2,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    heroImage: heroImage.id,
    meta: {
      description:
        'Explore how Retrieval-Augmented Generation (RAG) is transforming AI by combining knowledge retrieval with generative models for more accurate, reliable responses.',
      image: heroImage.id,
      title: 'RAG Applications: Transforming AI with Knowledge-Grounded Responses',
    },
    relatedPosts: [],
    title: 'RAG Applications: Transforming AI with Knowledge-Grounded Responses',
  }
}
