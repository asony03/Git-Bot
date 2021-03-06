from flask import Flask, request, jsonify
app = Flask(__name__)

import tensorflow as tf
from utils import IssueLabeler
from tensorflow.keras.models import load_model
import dill as dpickle

best_model = load_model('../model/Issue_Label_v1_best_model.hdf5')

#load the pre-processors
with open('../model/pickles/title_pp.dpkl', 'rb') as f:
  title_pp = dpickle.load(f)

with open('../model/pickles/body_pp.dpkl', 'rb') as f:
  body_pp = dpickle.load(f)
    
# instantiate the IssueLabeler object
issue_labeler = IssueLabeler(body_text_preprocessor=body_pp,
                             title_text_preprocessor=title_pp,
                             model=best_model)

@app.route('/')
def hello_world():
    return 'App running on port: 3500'

@app.route('/labels', methods = ['POST'])
def label():
  prediction = issue_labeler.get_probabilities(body=request.json['body'], title=request.json['title'])
  return jsonify(prediction)

if __name__ == '__main__':
  app.run(host="localhost", port=3500)