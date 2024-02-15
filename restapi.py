import io
import datetime
from PIL import Image

import torch
from flask import Flask, request, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATETIME_FORMAT = "%Y-%m-%d_%H-%M-%S-%f"


@app.route("/v1/object-detection/yolov5", methods=["POST"])
def predict():
    if not request.method == "POST":
        return

    if request.files.get("image"):
        image_file = request.files["image"]
        image_bytes = image_file.read()
        img = Image.open(io.BytesIO(image_bytes))
        
        results = model(img, size=640)
        
        # Annotate the image with bounding boxes
        annotated_img = results.render()[0]
        
        # Convert NumPy array to PIL Image
        annotated_img_pil = Image.fromarray(annotated_img.astype('uint8'))

        # Save PIL Image to bytes
        img_byte_array = io.BytesIO()
        annotated_img_pil.save(img_byte_array, format='PNG')
        img_byte_array.seek(0)

        # Save annotated image and return its path
        now_time = datetime.datetime.now().strftime(DATETIME_FORMAT)
        img_savename = f"static/{now_time}.png"
        annotated_img_pil.save(img_savename)

        # Return the annotated image directly as a file
        return send_file(img_byte_array, mimetype='image/png', as_attachment=True, download_name=f"{now_time}_annotated.png")

if __name__ == "__main__":
    model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
    model.eval()
    app.run(host="0.0.0.0", port=5000)
