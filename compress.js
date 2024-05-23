document.getElementById('compressButton').addEventListener('click', async () => {
    const inputFile = document.getElementById('inputFile').files[0];
    
    if (!inputFile) {
        alert('Please select a video file first.');
        return;
    }

    const reader = new FileReader();

    reader.onload = async function (event) {
        const data = new Uint8Array(event.target.result);
        
        const ffmpeg = await createFFmpeg({ log: true });
        await ffmpeg.load();
        
        ffmpeg.FS('writeFile', 'input.mp4', data);
        await ffmpeg.run('-i', 'input.mp4', '-vcodec', 'libx264', '-crf', '28', 'output.mp4');
        
        const output = ffmpeg.FS('readFile', 'output.mp4');
        const blob = new Blob([output.buffer], { type: 'video/mp4' });

        const url = URL.createObjectURL(blob);
        document.getElementById('videoPlayer').src = url;

        // Optional: download the compressed video
        const a = document.createElement('a');
        a.href = url;
        a.download = 'compressed_video.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    reader.readAsArrayBuffer(inputFile);
});
