'''js
var b = document.querySelectorAll('.card.w-full.h-full.mt-2 .flex.p-2.gap-3.items-start');
var a='';
b.forEach(el => {
  a+=el.textContent; // or el.innerText if you want only visible text
});
console.log(a)
'''