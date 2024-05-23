import os
from flask import Flask, request, jsonify
from google.cloud import storage
import ffmpeg

app = Flask(__name__)

@app.route('/compress', methods=['POST'])
def compress_video():
    try:
        file = request.files['file']
        input_file_path = f'/tmp/{file.filename}'
        output_file_path = f'/tmp/compressed_{file.filename}'

        file.save(input_file_path)

        ffmpeg.input(input_file_path).output(output_file_path, vcodec='libx264', crf=28).run()

        client = storage.Client()
        bucket = client.get_bucket('korals_kova')  # Replace with your bucket name
        blob = bucket.blob(f'compressed_{file.filename}')
        blob.upload_from_filename(output_file_path)

        return jsonify({'url': blob.public_url}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Function to be called by Google Cloud Functions
def app_wrapper(request):
    with app.test_request_context(environ_base=request.environ):
        return app.full_dispatch_request()
