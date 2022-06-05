
import spacy

# python3 -m spacy download en_core_web_trf
nlp = spacy.load("en_core_web_trf")

data = [
    "He works at Bank of Australia.",
    'Apple\'s stock has reached its highest price in 20 years',
    'APPL has reached its highest price in 20 years'
]

# spacy.displacy.serve(doc, style="ent")


for d in data:
    doc = nlp(d)

    for ent in doc.ents:
        print(f'{ent.text}, {ent.label_}')
    # displacy_html = spacy.displacy.render(doc, style="ent")
    # print(displacy_html)