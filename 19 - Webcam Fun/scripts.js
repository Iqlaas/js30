const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
	navigator.mediaDevices.getUserMedia({ video: true, audio: false })
		.then(localMediaStream => {
			console.log(localMediaStream);
			video.src = window.URL.createObjectURL(localMediaStream);
			video.play();
		})
		.catch(error => {
			console.log(`try again!`, error);
		});
}

function paintToCanvas() {
	const width = video.videoWidth;
	const height = video.videoHeight;
	console.log(width, height); //size coming in from webcam
	canvas.width = width;
	canvas.height = height;

	setInterval(() => {
		ctx.drawImage(video, 0, 0, width, height);
		// take the pixels out
		let pixels = ctx.getImageData(0, 0, width, height);
		// mess with the pixels
		// pixels = redEffect(pixels);

		// pixels = rgbSplit(pixels);
		// ctx.globalAlpha = 0.8;
		// put the pixels back
		pixels = greenScreen(pixels);

		ctx.putImageData(pixels, 0, 0);
		// console.log(pixels);
		// debugger - there will be milions of pixels. putting debugger will stop at only 1 pixel.
	}, 16);
}

function takePhoto() {
	// played the sound
	snap.currentTime = 0;
	snap.play();

	// take the data out of the canvas
	const data = canvas.toDataURL('image/jpeg');
	const link = document.createElement('a');
	link.href = data;
	link.setAttribute('download', 'handsome');
	// link.textContent = 'Download Image';
	link.innerHTML = `<img src=${data} alt="Handsome Man" />`;
	// jquery .prepend
	strip.insertBefore(link, strip.firstChild);
}

function redEffect(pixels) {
	for(let i = 0; i < pixels.data.length; i+=4) {
		pixels.data[i + 0] = pixels.data[i + 0] + 100; //red
		pixels.data[i + 1] = pixels.data[i + 1] - 50; //green
		pixels.data[i + 2] = pixels.data[i + 2] * 0.5; //blue
	}
	return pixels;
}

function rgbSplit(pixels) {
	for(let i = 0; i < pixels.data.length; i+=4) {
		pixels.data[i - 150] = pixels.data[i + 0];
		pixels.data[i + 100] = pixels.data[i + 1];
		pixels.data[i - 150] = pixels.data[i + 2];
	}
	return pixels;
}

function greenScreen(pixels) {
	const levels = {};

	document.querySelectorAll('.rgb input').forEach((input) => {
		levels[input.name] = input.value;
	});
	// console.log(levels);

	for (i = 0; i < pixels.data.length; i = i + 4) {
		red = pixels.data[i + 0];
		green = pixels.data[i + 1];
		blue = pixels.data[i + 2];
		alpha = pixels.data[i + 3];

		if (red >= levels.rmin 
			&& green >= levels.gmin
			&& blue >= levels.bmin
			&& red <= levels.rmax
			&& green <= levels.gmax
			&& blue <= levels.bmax) {
			// take alpha out
			pixels.data[i + 3] = 0;
		}
		
	}
	return pixels;
}
getVideo();

video.addEventListener('canplay', paintToCanvas);