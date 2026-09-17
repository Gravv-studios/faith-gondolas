(() => {
  'use strict';

  const cabecalho = document.querySelector('.top');
  if (cabecalho && 'ResizeObserver' in window) {
    new ResizeObserver(() => {
      document.documentElement.style.setProperty('--site-header-height', cabecalho.offsetHeight + 'px');
    }).observe(cabecalho);
  }
  const atalhos = document.querySelector('.storage-section-nav');
  if (atalhos) {
    const secoes = [...atalhos.querySelectorAll('a[href^="#"]')].map(link => ({
      link, secao: document.getElementById(link.hash.slice(1))
    })).filter(item => item.secao);
    let agendado = false;
    const indicarSecao = () => {
      agendado = false;
      const limite = (cabecalho?.offsetHeight || 0) + atalhos.offsetHeight + 40;
      let atual = secoes[0];
      secoes.forEach(item => { if (item.secao.getBoundingClientRect().top <= limite) atual = item; });
      secoes.forEach(item => {
        if (item === atual) item.link.setAttribute('aria-current', 'location');
        else item.link.removeAttribute('aria-current');
      });
    };
    const agendar = () => { if (!agendado) { agendado = true; requestAnimationFrame(indicarSecao); } };
    window.addEventListener('scroll', agendar, {passive: true});
    window.addEventListener('resize', agendar, {passive: true});
    window.addEventListener('pageshow', agendar);
    indicarSecao();
  }

  document.querySelectorAll('[data-whatsapp-produto]').forEach(link => {
    const produto = link.dataset.whatsappProduto || 'Produto da Faith Gôndolas';
    const codigo = link.dataset.whatsappCodigo;
    const medidas = link.dataset.whatsappMedidas;
    const linhas = [
      'Olá, Faith Gôndolas!',
      '',
      'Tenho interesse neste produto:',
      '*' + produto + '*'
    ];
    if (codigo) linhas.push('Código: ' + codigo);
    if (medidas) linhas.push('Medidas: ' + medidas);
    linhas.push('Link do produto: ' + location.href, '',
      'Gostaria de receber mais informações e um orçamento.');
    link.href = 'https://wa.me/5561982559938?text=' + encodeURIComponent(linhas.join('\n'));
  });

  document.querySelectorAll('[data-product-depth-retired]').forEach(viewer => {
    const stage = viewer.querySelector('.photo-stage');
    const scene = viewer.querySelector('.photo-scene');
    if (!stage || !scene) return;
    let alvoX=0,alvoY=0,atualX=0,atualY=0,zoom=1.035,atualZoom=zoom,inicio=null;
    const limita=(valor,min,max)=>Math.max(min,Math.min(max,valor));
    const desenha=()=>{
      atualX+=(alvoX-atualX)*.115; atualY+=(alvoY-atualY)*.115; atualZoom+=(zoom-atualZoom)*.115;
      scene.style.transform=`perspective(900px) rotateX(${atualX}deg) rotateY(${atualY}deg) scale(${atualZoom})`;
      requestAnimationFrame(desenha);
    };
    const reinicia=()=>{alvoX=0;alvoY=0;zoom=1.035;};
    stage.addEventListener('pointerdown',evento=>{
      evento.preventDefault();
      inicio={x:evento.clientX,y:evento.clientY,rx:alvoX,ry:alvoY};
      stage.setPointerCapture(evento.pointerId); stage.classList.add('is-dragging');
    });
    stage.addEventListener('pointermove',evento=>{
      if(!inicio)return;
      evento.preventDefault();
      alvoY=limita(inicio.ry+(evento.clientX-inicio.x)*.035,-5.5,5.5);
      alvoX=limita(inicio.rx-(evento.clientY-inicio.y)*.03,-4,4);
    });
    const encerra=evento=>{
      if(!inicio)return;
      inicio=null; stage.classList.remove('is-dragging');
      if(stage.hasPointerCapture(evento.pointerId))stage.releasePointerCapture(evento.pointerId);
    };
    stage.addEventListener('pointerup',encerra); stage.addEventListener('pointercancel',encerra);
    stage.addEventListener('wheel',evento=>{evento.preventDefault();zoom=limita(zoom-evento.deltaY*.00022,1.035,1.13);},{passive:false});
    stage.addEventListener('keydown',evento=>{
      let usou=true;
      if(evento.key==='ArrowLeft')alvoY-=1.2;else if(evento.key==='ArrowRight')alvoY+=1.2;
      else if(evento.key==='ArrowUp')alvoX+=1;else if(evento.key==='ArrowDown')alvoX-=1;
      else if(evento.key==='+'||evento.key==='=')zoom=limita(zoom+.02,1.035,1.13);
      else if(evento.key==='-')zoom=limita(zoom-.02,1.035,1.13);
      else if(evento.key==='Home')reinicia();else usou=false;
      alvoX=limita(alvoX,-4,4);alvoY=limita(alvoY,-5.5,5.5);
      if(usou)evento.preventDefault();
    });
    stage.addEventListener('dblclick',reinicia);
    requestAnimationFrame(desenha);
  });

  document.querySelectorAll('[data-product-3d]').forEach(viewer => {
    const stage = viewer.querySelector('.model-stage');
    const canvas = viewer.querySelector('.model-canvas');
    if (!stage || !canvas) return;
    const gl = canvas.getContext('webgl', {antialias: true, alpha: true});
    if (!gl) return;
    try {

    const shader = (tipo, codigo) => {
      const item = gl.createShader(tipo);
      gl.shaderSource(item, codigo); gl.compileShader(item);
      if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(item));
      return item;
    };
    const programa = gl.createProgram();
    gl.attachShader(programa, shader(gl.VERTEX_SHADER,
      'attribute vec3 p;attribute vec3 n;uniform mat4 proj,view,model;varying vec3 normal;void main(){gl_Position=proj*view*model*vec4(p,1.0);normal=mat3(model)*n;}'));
    gl.attachShader(programa, shader(gl.FRAGMENT_SHADER,
      'precision mediump float;uniform vec3 cor;varying vec3 normal;void main(){vec3 N=normalize(normal);float luz=.34+.48*max(dot(N,normalize(vec3(-.45,.8,.55))),0.0)+.18*max(dot(N,normalize(vec3(.7,.25,-.5))),0.0);gl_FragColor=vec4(cor*luz+vec3(.018),1.0);}'));
    gl.linkProgram(programa);
    if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) return;
    gl.useProgram(programa);

    const vertices = [], normais = [];
    const face = (a,b,c,d,n) => { [a,b,c,a,c,d].forEach(v => vertices.push(...v)); for(let i=0;i<6;i++) normais.push(...n); };
    face([-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5],[0,0,1]);
    face([.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5],[0,0,-1]);
    face([.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5],[1,0,0]);
    face([-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5],[-1,0,0]);
    face([-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5],[0,1,0]);
    face([-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5],[0,-1,0]);
    const criaMalha = (posicoes, direcoes) => {
      const pos=gl.createBuffer(),nor=gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,pos);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(posicoes),gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER,nor);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(direcoes),gl.STATIC_DRAW);
      return {pos,nor,total:posicoes.length/3};
    };
    const criaEsfera = (faixas=18,segmentos=28) => {
      const v=[],n=[],ponto=(t,a)=>[Math.sin(t)*Math.cos(a),Math.cos(t),Math.sin(t)*Math.sin(a)];
      const inclui=(a,b,c)=>{v.push(...a,...b,...c);n.push(...a,...b,...c);};
      for(let i=0;i<faixas;i++)for(let j=0;j<segmentos;j++){
        const t0=i*Math.PI/faixas,t1=(i+1)*Math.PI/faixas,a0=j*Math.PI*2/segmentos,a1=(j+1)*Math.PI*2/segmentos;
        const p00=ponto(t0,a0),p01=ponto(t0,a1),p10=ponto(t1,a0),p11=ponto(t1,a1);
        inclui(p00,p10,p11);inclui(p00,p11,p01);
      }
      return criaMalha(v,n);
    };
    const criaCilindro = (segmentos=28) => {
      const v=[],n=[],inclui=(a,b,c,na,nb=na,nc=na)=>{v.push(...a,...b,...c);n.push(...na,...nb,...nc);};
      for(let i=0;i<segmentos;i++){
        const a0=i*Math.PI*2/segmentos,a1=(i+1)*Math.PI*2/segmentos;
        const x0=Math.cos(a0)*.5,z0=Math.sin(a0)*.5,x1=Math.cos(a1)*.5,z1=Math.sin(a1)*.5;
        const n0=[Math.cos(a0),0,Math.sin(a0)],n1=[Math.cos(a1),0,Math.sin(a1)];
        inclui([x0,-.5,z0],[x1,-.5,z1],[x1,.5,z1],n0,n1,n1);inclui([x0,-.5,z0],[x1,.5,z1],[x0,.5,z0],n0,n1,n0);
        inclui([0,.5,0],[x0,.5,z0],[x1,.5,z1],[0,1,0]);inclui([0,-.5,0],[x1,-.5,z1],[x0,-.5,z0],[0,-1,0]);
      }
      return criaMalha(v,n);
    };
    const criaPainel = () => {
      const v=[],n=[],contorno=[[-.78,-1],[.78,-1],[.98,-.64],[1,.56],[.87,1],[-.87,1],[-1,.56],[-.98,-.64]],prof=.5;
      const inclui=(a,b,c,nor)=>{v.push(...a,...b,...c);n.push(...nor,...nor,...nor);};
      for(let i=0;i<contorno.length;i++){
        const j=(i+1)%contorno.length,a=contorno[i],b=contorno[j];
        inclui([0,0,prof],[a[0],a[1],prof],[b[0],b[1],prof],[0,0,1]);
        inclui([0,0,-prof],[b[0],b[1],-prof],[a[0],a[1],-prof],[0,0,-1]);
        const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nor=[dy/l,-dx/l,0];
        inclui([a[0],a[1],-prof],[b[0],b[1],-prof],[b[0],b[1],prof],nor);
        inclui([a[0],a[1],-prof],[b[0],b[1],prof],[a[0],a[1],prof],nor);
      }
      return criaMalha(v,n);
    };
    const malhas={caixa:criaMalha(vertices,normais),esfera:criaEsfera(),cilindro:criaCilindro(),painel:criaPainel()};
    const aP=gl.getAttribLocation(programa,'p'),aN=gl.getAttribLocation(programa,'n');
    gl.enableVertexAttribArray(aP);gl.enableVertexAttribArray(aN);
    const ligaMalha = malha => {
      gl.bindBuffer(gl.ARRAY_BUFFER,malha.pos);gl.vertexAttribPointer(aP,3,gl.FLOAT,false,0,0);
      gl.bindBuffer(gl.ARRAY_BUFFER,malha.nor);gl.vertexAttribPointer(aN,3,gl.FLOAT,false,0,0);
    };

    const identidade = () => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    const multiplica = (a,b) => { const o=Array(16).fill(0); for(let c=0;c<4;c++) for(let r=0;r<4;r++) for(let k=0;k<4;k++) o[c*4+r]+=a[k*4+r]*b[c*4+k]; return o; };
    const translada = (x,y,z) => { const m=identidade(); m[12]=x;m[13]=y;m[14]=z;return m; };
    const escala = (x,y,z) => { const m=identidade();m[0]=x;m[5]=y;m[10]=z;return m; };
    const giraX = a => { const m=identidade(),c=Math.cos(a),s=Math.sin(a);m[5]=c;m[6]=s;m[9]=-s;m[10]=c;return m; };
    const giraY = a => { const m=identidade(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[2]=-s;m[8]=s;m[10]=c;return m; };
    const giraZ = a => { const m=identidade(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[1]=s;m[4]=-s;m[5]=c;return m; };
    const perspectiva = (fov,aspecto,perto,longe) => { const f=1/Math.tan(fov/2),m=Array(16).fill(0);m[0]=f/aspecto;m[5]=f;m[10]=(longe+perto)/(perto-longe);m[11]=-1;m[14]=2*longe*perto/(perto-longe);return m; };
    const normaliza = v => { const l=Math.hypot(...v)||1; return v.map(n=>n/l); };
    const produtoVetorial = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    const olhaPara = (olho, alvo) => {
      const z=normaliza(olho.map((n,i)=>n-alvo[i])),x=normaliza(produtoVetorial([0,1,0],z)),y=produtoVetorial(z,x);
      return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-x.reduce((s,n,i)=>s+n*olho[i],0),-y.reduce((s,n,i)=>s+n*olho[i],0),-z.reduce((s,n,i)=>s+n*olho[i],0),1];
    };
    const azul=[.055,.25,.34], laranja=[.88,.36,.035], amarelo=[.94,.67,.04], cinza=[.56,.63,.66], piso=[.82,.87,.88];
    const grafite=[.095,.105,.11], preto=[.028,.032,.035], malha=[.22,.24,.25], metal=[.50,.55,.58], bege=[.76,.71,.62];
    const pecas=[];
    const peca=(forma,x,y,z,sx,sy,sz,cor,rx=0,ry=0,rz=0)=>pecas.push({forma,x,y,z,sx,sy,sz,cor,rx,ry,rz});
    const caixa=(x,y,z,sx,sy,sz,cor,rx=0,ry=0,rz=0)=>peca('caixa',x,y,z,sx,sy,sz,cor,rx,ry,rz);
    const esfera=(x,y,z,sx,sy,sz,cor,rx=0,ry=0,rz=0)=>peca('esfera',x,y,z,sx,sy,sz,cor,rx,ry,rz);
    const cilindro=(x,y,z,sx,sy,sz,cor,rx=0,ry=0,rz=0)=>peca('cilindro',x,y,z,sx,sy,sz,cor,rx,ry,rz);
    const painel=(x,y,z,sx,sy,sz,cor,rx=0,ry=0,rz=0)=>peca('painel',x,y,z,sx,sy,sz,cor,rx,ry,rz);
    const tipo=viewer.dataset.modelKind||'rack';
    let alvoModelo, raioInicial, raioMinimo, raioMaximo;
    if(tipo==='chair'){
      // Darix X+: volumes arredondados e estrutura inspirada diretamente na foto do catálogo.
      esfera(0,2.62,.08,1.48,.34,1.22,grafite,-.08);
      caixa(0,2.43,-.82,2.35,.18,.20,preto,-.08);
      painel(0,3.92,-.25,1.16,1.28,.12,malha,-.07);
      caixa(-1.08,3.92,-.23,.11,2.12,.20,grafite,-.07);
      caixa(1.08,3.92,-.23,.11,2.12,.20,grafite,-.07);
      painel(0,5.10,-.34,.96,.38,.16,malha,-.06);
      caixa(-.84,5.10,-.33,.10,.60,.20,grafite,-.06);
      caixa(.84,5.10,-.33,.10,.60,.20,grafite,-.06);
      cilindro(0,4.70,-.30,.22,.42,.22,grafite);
      caixa(-.58,3.92,-.08,.15,1.78,.18,grafite,-.07,0,-.50);
      caixa(.58,3.92,-.08,.15,1.78,.18,grafite,-.07,0,.50);
      caixa(0,3.05,-.10,1.90,.13,.22,grafite,-.07);
      [-1.26,1.26].forEach(x=>{
        cilindro(x,3.10,.06,.18,1.05,.18,grafite,0,0,x<0?-.06:.06);
        esfera(x,3.60,.04,.48,.12,.34,grafite);
      });
      cilindro(0,2.15,-.08,.62,.58,.62,preto);
      cilindro(0,1.48,-.08,.34,1.00,.34,grafite);
      cilindro(0,.92,-.08,.60,.20,.60,preto);
      for(let i=0;i<5;i++){
        const a=i*Math.PI*2/5, comprimento=1.75;
        caixa(Math.sin(a)*.78,.76,Math.cos(a)*.78,.22,.14,comprimento,grafite,0,a,0);
        cilindro(Math.sin(a)*1.58,.46,Math.cos(a)*1.58,.42,.24,.42,preto,0,a,Math.PI/2);
        cilindro(Math.sin(a)*1.58,.46,Math.cos(a)*1.58,.28,.26,.28,metal,0,a,Math.PI/2);
      }
      caixa(0,.18,0,5.3,.06,5.3,piso);
      alvoModelo=[0,2.75,0];raioInicial=8.4;raioMinimo=5.9;raioMaximo=12;
    } else if(tipo==='mini-rack') {
      [-2.25,2.25].forEach(x => {
        [-.74,.74].forEach(z => caixa(x,2.35,z,.14,4.70,.14,cinza));
        caixa(x,.10,-.74,.50,.18,.46,cinza);caixa(x,.10,.74,.50,.18,.46,cinza);
        [[1.15,1],[2.55,-1],[3.70,1]].forEach(([y,sentido]) => {
          const dy=1.25,dz=1.28*sentido,comprimento=Math.hypot(dy,dz);
          caixa(x,y,0,.075,comprimento,.075,metal,Math.atan2(dz,dy));
        });
      });
      [.62,2.18,3.74].forEach((y,nivel) => {
        [-.74,.74].forEach(z => caixa(0,y,z,4.34,.18,.18,laranja));
        caixa(0,y+.11,0,4.28,.08,1.30,metal);
        const colunas=nivel===2?4:5;
        for(let coluna=0;coluna<colunas;coluna++)for(let pilha=0;pilha<(nivel===1?2:3);pilha++){
          const x=-1.62+coluna*(3.24/Math.max(1,colunas-1));
          esfera(x,y+.33+pilha*.31,0,.34,.15,.47,bege,0,.04*(coluna-2));
        }
      });
      caixa(0,-.07,0,6.0,.08,3.1,piso);
      alvoModelo=[0,2.28,0];raioInicial=8.6;raioMinimo=6.0;raioMaximo=12.5;
    } else {
      [-2.4,0,2.4].forEach(x => {
        [-.72,.72].forEach(z => caixa(x,2.55,z,.14,5.1,.14,azul));
        caixa(x,.12,-.72,.52,.20,.48,amarelo); caixa(x,.12,.72,.52,.20,.48,amarelo);
        [[1.0,1],[2.55,-1],[4.1,1]].forEach(([y,sentido]) => {
          const dy=1.48,dz=1.28*sentido,comprimento=Math.hypot(dy,dz);
          caixa(x,y,0,.075,comprimento,.075,cinza,Math.atan2(dz,dy));
        });
      });
      [1.2,2.45,3.7,4.92].forEach(y => [-.72,.72].forEach(z => {
        caixa(-1.2,y,z,2.28,.16,.18,laranja); caixa(1.2,y,z,2.28,.16,.18,laranja);
      }));
      caixa(0,-.07,0,6.4,.08,3.4,piso);
      alvoModelo=[0,2.45,0];raioInicial=9.2;raioMinimo=6.4;raioMaximo=13;
    }

    const unif = nome => gl.getUniformLocation(programa,nome);
    const uProj=unif('proj'),uView=unif('view'),uModel=unif('model'),uCor=unif('cor');
    let yaw=.58,pitch=.24,raio=raioInicial,ultimo=null,interagiu=0;
    const reduzMovimento=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const desenha = tempo => {
      const largura=Math.max(1,stage.clientWidth),altura=Math.max(1,stage.clientHeight),dpr=Math.min(window.devicePixelRatio||1,2);
      const w=Math.round(largura*dpr),h=Math.round(altura*dpr);
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
      if(!reduzMovimento && !ultimo && tempo-interagiu>4500) yaw+=.0012;
      const alvo=alvoModelo,cp=Math.cos(pitch),olho=[alvo[0]+raio*cp*Math.sin(yaw),alvo[1]+raio*Math.sin(pitch),alvo[2]+raio*cp*Math.cos(yaw)];
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);
      gl.uniformMatrix4fv(uProj,false,new Float32Array(perspectiva(.72,w/h,.1,50)));
      gl.uniformMatrix4fv(uView,false,new Float32Array(olhaPara(olho,alvo)));
      pecas.forEach(p => {
        const rotacao=multiplica(giraX(p.rx),multiplica(giraY(p.ry),giraZ(p.rz)));
        const model=multiplica(translada(p.x,p.y,p.z),multiplica(rotacao,escala(p.sx,p.sy,p.sz)));
        const malha=malhas[p.forma];ligaMalha(malha);
        gl.uniformMatrix4fv(uModel,false,new Float32Array(model));gl.uniform3fv(uCor,new Float32Array(p.cor));gl.drawArrays(gl.TRIANGLES,0,malha.total);
      });
      requestAnimationFrame(desenha);
    };
    const marcaInteracao=()=>{interagiu=performance.now();};
    stage.addEventListener('pointerdown', e => {e.preventDefault();ultimo={x:e.clientX,y:e.clientY};stage.setPointerCapture(e.pointerId);stage.classList.add('is-dragging');marcaInteracao();});
    stage.addEventListener('pointermove', e => {if(!ultimo)return;e.preventDefault();yaw-=(e.clientX-ultimo.x)*.009;pitch=Math.max(-.62,Math.min(1.22,pitch+(e.clientY-ultimo.y)*.009));ultimo={x:e.clientX,y:e.clientY};marcaInteracao();});
    const encerra=e=>{if(!ultimo)return;ultimo=null;stage.classList.remove('is-dragging');if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);marcaInteracao();};
    stage.addEventListener('pointerup',encerra);stage.addEventListener('pointercancel',encerra);
    stage.addEventListener('wheel',e=>{e.preventDefault();raio=Math.max(raioMinimo,Math.min(raioMaximo,raio+e.deltaY*.008));marcaInteracao();},{passive:false});
    stage.addEventListener('keydown',e=>{let usou=true;if(e.key==='ArrowLeft')yaw-=.12;else if(e.key==='ArrowRight')yaw+=.12;else if(e.key==='ArrowUp')pitch=Math.min(1.22,pitch+.10);else if(e.key==='ArrowDown')pitch=Math.max(-.62,pitch-.10);else if(e.key==='+'||e.key==='=')raio=Math.max(raioMinimo,raio-.5);else if(e.key==='-')raio=Math.min(raioMaximo,raio+.5);else if(e.key==='Home'){yaw=.58;pitch=.24;raio=raioInicial;}else usou=false;if(usou){e.preventDefault();marcaInteracao();}});
    viewer.classList.add('is-ready');
    requestAnimationFrame(desenha);
    } catch (erro) {
      console.warn('Modelo 3D indisponível; mantendo a foto do produto.', erro);
    }
  });

  document.querySelectorAll('[data-vitrine]').forEach(vitrine => {
    const faixa = vitrine.querySelector('.storage-slides');
    if (!faixa) return;
    const fotos = [...faixa.querySelectorAll('.storage-slide')];
    if (!fotos.length) return;
    const posicao = vitrine.querySelector('[data-posicao]');
    const miniaturas = [...vitrine.querySelectorAll('[data-slide]')];
    let atual = 0;
    let pausado = false;
    let pausaPorFoco = false;
    let visivel = true;
    let ultimaTroca = Date.now();
    const pausa = vitrine.querySelector('[data-pausa]');
    const mostrar = indice => {
      atual = (indice + fotos.length) % fotos.length;
      fotos.forEach((foto, i) => {
        const ativa = i === atual;
        foto.classList.toggle('is-active', ativa);
        foto.inert = !ativa;
        foto.setAttribute('aria-hidden', String(!ativa));
      });
      miniaturas.forEach((botao, i) => botao.setAttribute('aria-pressed', String(i === atual)));
      if (posicao) posicao.textContent = String(atual + 1).padStart(2, '0') + ' / ' + String(fotos.length).padStart(2, '0');
      const proximaImagem = fotos[(atual + 1) % fotos.length].querySelector('img');
      if (proximaImagem) proximaImagem.loading = 'eager';
      ultimaTroca = Date.now();
    };
    const alternarPausa = () => {
      pausado = !pausado;
      pausa.textContent = pausado ? 'Reproduzir' : 'Pausar';
      pausa.setAttribute('aria-pressed', String(pausado));
      pausa.setAttribute('aria-label', pausado ? 'Reproduzir carrossel automático' : 'Pausar carrossel automático');
      pausaPorFoco = false;
      ultimaTroca = Date.now();
    };
    if (pausa) pausa.onclick = alternarPausa;
    vitrine.querySelector('[data-anterior]').onclick = () => mostrar(atual - 1);
    vitrine.querySelector('[data-proxima]').onclick = () => mostrar(atual + 1);
    miniaturas.forEach(botao => { botao.onclick = () => mostrar(Number(botao.dataset.slide)); });
    vitrine.addEventListener('focusin', evento => {
      if (evento.target.matches(':focus-visible')) pausaPorFoco = true;
    });
    vitrine.addEventListener('focusout', evento => {
      if (!vitrine.contains(evento.relatedTarget)) pausaPorFoco = false;
    });
    vitrine.addEventListener('keydown', evento => {
      if (evento.key !== 'ArrowLeft' && evento.key !== 'ArrowRight') return;
      evento.preventDefault();
      mostrar(atual + (evento.key === 'ArrowRight' ? 1 : -1));
    });
    let inicio = null;
    let arrastou = false;
    faixa.querySelectorAll('img').forEach(img => { img.draggable = false; });
    faixa.addEventListener('pointerdown', evento => {
      inicio = {x: evento.clientX, y: evento.clientY};
      arrastou = false;
    });
    faixa.addEventListener('pointerup', evento => {
      if (!inicio) return;
      const dx = evento.clientX - inicio.x;
      const dy = evento.clientY - inicio.y;
      inicio = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        arrastou = true;
        mostrar(atual + (dx < 0 ? 1 : -1));
      }
    });
    faixa.addEventListener('pointercancel', () => { inicio = null; });
    faixa.addEventListener('click', evento => {
      if (arrastou) { evento.preventDefault(); arrastou = false; }
    }, true);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entradas => {
        visivel = entradas[0].isIntersecting;
      }, {threshold: 0.1}).observe(vitrine);
    }
    mostrar(0);
    vitrine.classList.add('is-ready');
    setInterval(() => {
      // Mouse parado sobre a foto não interrompe a apresentação automática.
      if (!pausado && !pausaPorFoco && visivel && !document.hidden &&
          Date.now() - ultimaTroca >= 5500) mostrar(atual + 1);
    }, 500);
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const destaques = [...hero.querySelectorAll(':scope > .hero')];
    const anterior = hero.querySelector('.hero-prev');
    const proximo = hero.querySelector('.hero-next');
    let atual = 0;
    let ultimaTroca = Date.now();
    hero.classList.add('enhanced');
    const mostrar = indice => {
      atual = (indice + destaques.length) % destaques.length;
      destaques.forEach((slide, i) => {
        const ativo = i === atual;
        slide.classList.toggle('active', ativo);
        slide.inert = !ativo;
        slide.setAttribute('aria-hidden', String(!ativo));
      });
      ultimaTroca = Date.now();
    };
    mostrar(0);
    if (anterior) anterior.addEventListener('click', () => mostrar(atual - 1));
    if (proximo) proximo.addEventListener('click', () => mostrar(atual + 1));
    setInterval(() => {
      if (!document.hidden && !hero.contains(document.activeElement) &&
          !hero.matches(':hover') && Date.now() - ultimaTroca >= 5000) mostrar(atual + 1);
    }, 250);
  }
})();
