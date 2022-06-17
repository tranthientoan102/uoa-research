
from sentence_transformers import SentenceTransformer
import spacy


embedding_model = SentenceTransformer('distilbert-base-nli-mean-tokens')
nlp = spacy.load('en_core_web_sm')
