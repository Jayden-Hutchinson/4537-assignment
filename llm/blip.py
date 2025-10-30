from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import requests

# Load the BLIP-base model
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

# Example: Load image from URL
url = "https://images.unsplash.com/photo-1761735679475-9321c24f2794?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870"
img = Image.open(requests.get(url, stream=True).raw)

# Preprocess and generate caption
inputs = processor(images=img, return_tensors="pt")
outputs = model.generate(**inputs)
caption = processor.decode(outputs[0], skip_special_tokens=True)

print("Caption:", caption)
