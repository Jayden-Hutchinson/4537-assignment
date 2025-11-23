from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS # Import CORS
import base64
import io

'''
need to run this first to install dependencies:
    pip install torch torchvision transformers pillow flask
'''

app = Flask(__name__)
CORS(app)
# Load the BLIP-base model
print("Loading BLIP model...")
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
print("BLIP model loaded successfully!")

@app.route('/api/blip/analyze', methods=['POST'])
def analyze_image():
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Handle base64 image data
        image_data = data['image']
        
        # Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        if 'base64,' in image_data:
            image_data = image_data.split('base64,')[1]
        
        # Decode base64 to image
        image_bytes = base64.b64decode(image_data)
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Generate caption
        inputs = processor(images=img, return_tensors="pt")
        outputs = model.generate(**inputs)
        caption = processor.decode(outputs[0], skip_special_tokens=True)
        
        print(f"Generated caption: {caption}")
        
        return jsonify({
            'caption': caption,
            'description': caption
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
