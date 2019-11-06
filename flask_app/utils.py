class IssueLabeler:
    def __init__(self, 
                 body_text_preprocessor, 
                 title_text_preprocessor, 
                 model, 
                 class_names=['bug', 'feature_request', 'question']):
        self.body_pp = body_text_preprocessor
        self.title_pp = title_text_preprocessor
        self.model = model
        self.class_names = class_names
        
    
    def get_probabilities(self, body:str, title:str):
        #transform raw text into array of ints
        vec_body = self.body_pp.transform([body])
        vec_title = self.title_pp.transform([title])
        
        # get predictions
        probs = self.model.predict(x=[vec_body, vec_title]).tolist()[0]
        
        return {k:v for k,v in zip(self.class_names, probs)}