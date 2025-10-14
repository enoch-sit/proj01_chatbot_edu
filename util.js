var b = document.querySelectorAll('.lesson-video-player.max-h-course-content .text-neutral');
var a = ''
b.forEach(el => {
  a += el.textContent; // or el.innerText if you want only visible text
});
console.log(a)
//amazon.nova-lite-v1:0