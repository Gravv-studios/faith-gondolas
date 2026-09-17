
/* Carrossel da capa: anda sozinho e tambem se arrasta com o mouse.
   E o mesmo do site antigo, que foi o que o cliente aprovou. */
(function(){
  var tk = document.querySelector('.ticker');
  if (!tk) return;
  var track = tk.querySelector('.tk-track');
  var REPEAT = 4;
  var auto = true;
  var paused = false, ready = false;
  var pos = 0, last = 0;

  function unit(){ return track.scrollWidth / REPEAT; }

  /* mantem a posicao sempre no bloco do meio, da margem para os dois lados */
  function wrap(){
    var u = unit();
    if (u <= 0) return;
    while (pos >= u * 2) pos -= u;
    while (pos < u)      pos += u;
  }

  function frame(ts){
    var u = unit();
    if (!ready && u > 0){ pos = u; tk.scrollLeft = pos; ready = true; last = ts; }
    if (ready && auto && !paused && !pressed && !dragging){
      var dt = Math.min(60, ts - last);
      pos += dt * 0.020;              /* ~20 px por segundo: legivel e ainda vivo */
      wrap();
      tk.scrollLeft = pos;            /* posicao guardada em float, nao lida do DOM */
    }
    last = ts;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  tk.addEventListener('mouseenter', function(){ paused = true; });
  tk.addEventListener('mouseleave', function(){ paused = false; });
  tk.addEventListener('focusin',  function(){ paused = true; });
  tk.addEventListener('focusout', function(){ paused = false; });
  window.addEventListener('resize', function(){ ready = false; });

  /* Nada de setPointerCapture: ele reaponta o evento para a faixa e o clique
     nunca chega no link do cartao. Aqui o arraste e seguido na janela e so
     bloqueia o clique se o dedo ou o mouse andou de verdade. */
  var pressed = false, dragging = false, originX = 0, lastX = 0, suppress = false;
  var LIMIAR = 8;   /* px de folga: tremida de mao continua sendo clique */

  tk.addEventListener('pointerdown', function(e){
    if (e.button != null && e.button !== 0) return;
    pressed = true; dragging = false;
    originX = lastX = e.clientX;
    pos = tk.scrollLeft;
  });

  window.addEventListener('pointermove', function(e){
    if (!pressed) return;
    var dx = e.clientX - lastX;
    lastX = e.clientX;
    if (!dragging && Math.abs(e.clientX - originX) > LIMIAR){
      dragging = true;
      tk.classList.add('is-drag');
    }
    if (dragging){ pos -= dx; wrap(); tk.scrollLeft = pos; }
  });

  function soltar(){
    if (!pressed) return;
    pressed = false;
    tk.classList.remove('is-drag');
    if (dragging){
      suppress = true;                       /* arrastou: nao navega */
      setTimeout(function(){ suppress = false; }, 400);
    }
    dragging = false;
  }
  window.addEventListener('pointerup', soltar);
  window.addEventListener('pointercancel', soltar);

  tk.addEventListener('dragstart', function(e){ e.preventDefault(); });

  tk.addEventListener('click', function(e){
    if (suppress){ e.preventDefault(); e.stopPropagation(); suppress = false; }
  }, true);
})();
