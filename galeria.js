
/* Galeria do produto: clicar numa miniatura troca a foto grande.
   E melhoria de cima: sem JS a pagina continua mostrando a foto principal
   e todas as outras vistas, que e como ela sai do gerador. */
(function(){
  var caixa = document.querySelector('.miniatura');
  var grande = document.querySelector('.prod-fig img');
  if (!caixa || !grande) return;

  // a foto principal vira a primeira miniatura, senao nao da para voltar nela
  var primeira = document.createElement('img');
  primeira.src = grande.getAttribute('src');
  primeira.alt = grande.getAttribute('alt');
  caixa.insertBefore(primeira, caixa.firstChild);
  caixa.classList.add('viva');

  var minis = [].slice.call(caixa.querySelectorAll('img'));
  function mostra(m){
    grande.setAttribute('src', m.getAttribute('src'));
    grande.setAttribute('alt', m.getAttribute('alt'));
    minis.forEach(function(o){
      if (o === m) { o.setAttribute('aria-current', 'true'); }
      else { o.removeAttribute('aria-current'); }
    });
  }
  minis.forEach(function(m){
    m.setAttribute('role', 'button');
    m.setAttribute('tabindex', '0');
    m.addEventListener('click', function(){ mostra(m); });
    m.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mostra(m); }
    });
  });
  mostra(minis[0]);
})();
