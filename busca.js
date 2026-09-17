
(function(){
  'use strict';
  var q = document.getElementById('q');
  var grade = document.getElementById('grade');
  var conta = document.getElementById('conta');
  var vazio = document.getElementById('vazio');
  if(!q || !grade) return;
  var cards = Array.prototype.slice.call(grade.querySelectorAll('.card'));
  var secao = '';

  function limpa(s){
    return s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  }
  function aplica(){
    var termo = limpa(q.value.trim());
    var palavras = termo ? termo.split(/\s+/) : [];
    var n = 0;
    cards.forEach(function(c){
      var chave = c.getAttribute('data-busca') || '';
      var ok = (!secao || c.getAttribute('data-secao') === secao);
      if(ok){
        for(var i=0;i<palavras.length;i++){
          if(chave.indexOf(palavras[i]) === -1){ ok = false; break; }
        }
      }
      c.hidden = !ok;
      if(ok) n++;
    });
    conta.textContent = n + (n === 1 ? ' produto' : ' produtos');
    vazio.hidden = n > 0;
  }

  q.addEventListener('input', aplica);
  Array.prototype.forEach.call(document.querySelectorAll('.filtro'), function(b){
    b.addEventListener('click', function(){
      var s = b.getAttribute('data-secao');
      secao = (secao === s) ? '' : s;
      Array.prototype.forEach.call(document.querySelectorAll('.filtro'), function(o){
        o.setAttribute('aria-pressed', o.getAttribute('data-secao') === secao ? 'true' : 'false');
      });
      aplica();
    });
  });
})();
