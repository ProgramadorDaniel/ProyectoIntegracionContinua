
$defaultViewMode="full"; //// completa y normal , original
$tsMargin=30; //primero y último margen de miniaturas ( para una mejor interacción cursor)
$scrollEasing=600; //desplácese hacia la flexibilización cantidad ( 0 para no flexibilización )
$scrollEasingType="easeOutCirc"; //Tipo de flexibilización de desplazamiento
$thumbnailsContainerOpacity=0.8; //área de miniaturas opacidad por defecto
$thumbnailsContainerMouseOutOpacity=0; //miniaturas área de opacidad en ratón fuera
$thumbnailsOpacity=0.6; //opacidad miniaturas por defecto
$nextPrevBtnsInitState="show"; //siguientes botones de imagen anteriores / estado inicial ( "ocultar " o "show" )
$keyboardNavigation="on"; //permitir la navegación por teclado / desactivar ( "on" u "off" )

//cache vars
$thumbnails_wrapper=$("#thumbnails_wrapper");
$outer_container=$("#outer_container");
$thumbScroller=$(".thumbScroller");
$thumbScroller_container=$(".thumbScroller .container");
$thumbScroller_content=$(".thumbScroller .content");
$thumbScroller_thumb=$(".thumbScroller .thumb");
$preloader=$("#preloader");
$toolbar=$("#toolbar");
$toolbar_a=$("#toolbar a");
$bgimg=$("#bgimg");
$img_title=$("#img_title");
$nextImageBtn=$(".nextImageBtn");
$prevImageBtn=$(".prevImageBtn");

$(window).load(function() {
	$toolbar.data("imageViewMode",$defaultViewMode); //modo de vista por defecto
	if($defaultViewMode=="full"){
		$toolbar_a.html("<img src='images/toolbar_n_icon.png' width='50' height='50'  />").attr("onClick", "ImageViewMode('normal');return false").attr("title", "Restore");
	} else {
		$toolbar_a.html("<img src='images/toolbar_fs_icon.png' width='50' height='50'  />").attr("onClick", "ImageViewMode('full');return false").attr("title", "Maximize");
	}
	ShowHideNextPrev($nextPrevBtnsInitState);
	//scroller miniatura
	$thumbScroller_container.css("marginLeft",$tsMargin+"px"); //añadir margen
	sliderLeft=$thumbScroller_container.position().left;
	sliderWidth=$outer_container.width();
	$thumbScroller.css("width",sliderWidth);
	var totalContent=0;
	fadeSpeed=200;
	
	var $the_outer_container=document.getElementById("outer_container");
	var $placement=findPos($the_outer_container);
	
	$thumbScroller_content.each(function () {
		var $this=$(this);
		totalContent+=$this.innerWidth();
		$thumbScroller_container.css("width",totalContent);
		$this.children().children().children(".thumb").fadeTo(fadeSpeed, $thumbnailsOpacity);
	});

	$thumbScroller.mousemove(function(e){
		if($thumbScroller_container.width()>sliderWidth){
	  		var mouseCoords=(e.pageX - $placement[1]);
	  		var mousePercentX=mouseCoords/sliderWidth;
	  		var destX=-((((totalContent+($tsMargin*2))-(sliderWidth))-sliderWidth)*(mousePercentX));
	  		var thePosA=mouseCoords-destX;
	  		var thePosB=destX-mouseCoords;
	  		if(mouseCoords>destX){
		  		$thumbScroller_container.stop().animate({left: -thePosA}, $scrollEasing,$scrollEasingType); 
	  		} else if(mouseCoords<destX){
		  		$thumbScroller_container.stop().animate({left: thePosB}, $scrollEasing,$scrollEasingType); 
				$thumbScroller_container.stop();  
	  		}
		}
	});

	$thumbnails_wrapper.fadeTo(fadeSpeed, $thumbnailsContainerOpacity);
	$thumbnails_wrapper.hover(
		function(){ //mouse over
			var $this=$(this);
			$this.stop().fadeTo("slow", 1);
		},
		function(){ //mouse out
			var $this=$(this);
			$this.stop().fadeTo("slow", $thumbnailsContainerMouseOutOpacity);
		}
	);

	$thumbScroller_thumb.hover(
		function(){ //mouse over
			var $this=$(this);
			$this.stop().fadeTo(fadeSpeed, 1);
		},
		function(){ //mouse out
			var $this=$(this);
			$this.stop().fadeTo(fadeSpeed, $thumbnailsOpacity);
		}
	);

	//en la ventana de cambiar el tamaño de la imagen escala y restablecer scroller miniatura
	$(window).resize(function() {
		FullScreenBackground("#bgimg",$bgimg.data("newImageW"),$bgimg.data("newImageH"));
		$thumbScroller_container.stop().animate({left: sliderLeft}, 400,"easeOutCirc"); 
		var newWidth=$outer_container.width();
		$thumbScroller.css("width",newWidth);
		sliderWidth=newWidth;
		$placement=findPos($the_outer_container);
	});

	//primera carga de imágenes
	var the1stImg = new Image();
	the1stImg.onload = CreateDelegate(the1stImg, theNewImg_onload);
	the1stImg.src = $bgimg.attr("src");
	$outer_container.data("nextImage",$(".content").first().next().find("a").attr("href"));
	$outer_container.data("prevImage",$(".content").last().find("a").attr("href"));
});

function BackgroundLoad($this,imageWidth,imageHeight,imgSrc){
	$this.fadeOut("fast",function(){
		$this.attr("src", "").attr("src", imgSrc); //cambio de fuente de imagen
		FullScreenBackground($this,imageWidth,imageHeight); //imagen de fondo de escala
		$preloader.fadeOut("fast",function(){$this.fadeIn("slow");});
		var imageTitle=$img_title.data("imageTitle");
		if(imageTitle){
			$this.attr("alt", imageTitle).attr("title", imageTitle);
			$img_title.fadeOut("fast",function(){
				$img_title.html(imageTitle).fadeIn();
			});
		} else {
			$img_title.fadeOut("fast",function(){
				$img_title.html($this.attr("title")).fadeIn();
			});
		}
	});
}

//barra de herramientas mouseover
if($toolbar.css("display")!="none"){
	$toolbar.fadeTo("fast", 0.4);
}
$toolbar.hover(
	function(){ //mouse over
		var $this=$(this);
		$this.stop().fadeTo("fast", 1);
	},
	function(){ //mouse out
		var $this=$(this);
		$this.stop().fadeTo("fast", 0.4);
	}
);

//Al hacer clic en la imagen en miniatura cambia la imagen de fondo
$("#outer_container a").click(function(event){
	event.preventDefault();
	var $this=$(this);
	GetNextPrevImages($this);
	GetImageTitle($this);
	SwitchImage(this);
	ShowHideNextPrev("show");
}); 

//Imágenes siguiente / ant botones
$nextImageBtn.click(function(event){
	event.preventDefault();
	SwitchImage($outer_container.data("nextImage"));
	var $this=$("#outer_container a[href='"+$outer_container.data("nextImage")+"']");
	GetNextPrevImages($this);
	GetImageTitle($this);
});

$prevImageBtn.click(function(event){
	event.preventDefault();
	SwitchImage($outer_container.data("prevImage"));
	var $this=$("#outer_container a[href='"+$outer_container.data("prevImage")+"']");
	GetNextPrevImages($this);
	GetImageTitle($this);
});

//próximos imágenes / prev flechas del teclado
if($keyboardNavigation=="on"){
$(document).keydown(function(ev) {
    if(ev.keyCode == 39) { //flecha derecha
        SwitchImage($outer_container.data("nextImage"));
		var $this=$("#outer_container a[href='"+$outer_container.data("nextImage")+"']");
		GetNextPrevImages($this);
		GetImageTitle($this);
        return false; // no ejecutar la acción predeterminada ( desplazamiento o lo que sea )
    } else if(ev.keyCode == 37) { //left arrow
        SwitchImage($outer_container.data("prevImage"));
		var $this=$("#outer_container a[href='"+$outer_container.data("prevImage")+"']");
		GetNextPrevImages($this);
		GetImageTitle($this);
        return false; // no ejecutar la acción predeterminada ( desplazamiento o lo que sea )
    }
});
}

function ShowHideNextPrev(state){
	if(state=="hide"){
		$nextImageBtn.fadeOut();
		$prevImageBtn.fadeOut();
	} else {
		$nextImageBtn.fadeIn();
		$prevImageBtn.fadeIn();
	}
}

//obtener título de la imagen
function GetImageTitle(elem){
	var title_attr=elem.children("img").attr("title"); //obtener el atributo título de la imagen
	$img_title.data("imageTitle", title_attr); //almacén de imágenes título
}

//get next/prev images
function GetNextPrevImages(curr){
	var nextImage=curr.parents(".content").next().find("a").attr("href");
	if(nextImage==null){ //si la última imagen , el próximo es primero
		var nextImage=$(".content").first().find("a").attr("href");
	}
	$outer_container.data("nextImage",nextImage);
	var prevImage=curr.parents(".content").prev().find("a").attr("href");
	if(prevImage==null){ //si la primera imagen , anterior es pasado
		var prevImage=$(".content").last().find("a").attr("href");
	}
	$outer_container.data("prevImage",prevImage);
}

//imagen interruptor
function SwitchImage(img){
	$preloader.fadeIn("fast"); 
	var theNewImg = new Image();
	theNewImg.onload = CreateDelegate(theNewImg, theNewImg_onload);
	theNewImg.src = img;
}

//obtener nuevas dimensiones de imagen
function CreateDelegate(contextObject, delegateMethod){
	return function(){
		return delegateMethod.apply(contextObject, arguments);
	}
}

//nueva imagen de la carga
function theNewImg_onload(){
	$bgimg.data("newImageW",this.width).data("newImageH",this.height);
	BackgroundLoad($bgimg,this.width,this.height,this.src);
}

//Funcion escala de imagen
function FullScreenBackground(theItem,imageWidth,imageHeight){
	var winWidth=$(window).width();
	var winHeight=$(window).height();
	if($toolbar.data("imageViewMode")!="original"){ //escala
		var picHeight = imageHeight / imageWidth;
		var picWidth = imageWidth / imageHeight;
		if($toolbar.data("imageViewMode")=="full"){ //modo de tamaño de imagen completa
			if ((winHeight / winWidth) < picHeight) {
				$(theItem).attr("width",winWidth);
				$(theItem).attr("height",picHeight*winWidth);
			} else {
				$(theItem).attr("height",winHeight);
				$(theItem).attr("width",picWidth*winHeight);
			};
		} else { //modo normal tamaño imagen 
			if ((winHeight / winWidth) > picHeight) {
				$(theItem).attr("width",winWidth);
				$(theItem).attr("height",picHeight*winWidth);
			} else {
				$(theItem).attr("height",winHeight);
				$(theItem).attr("width",picWidth*winHeight);
			};
		}
		$(theItem).css("margin-left",(winWidth-$(theItem).width())/2);
		$(theItem).css("margin-top",(winHeight-$(theItem).height())/2);
	} else { //sin escala
		$(theItem).attr("width",imageWidth);
		$(theItem).attr("height",imageHeight);
		$(theItem).css("margin-left",(winWidth-imageWidth)/2);
		$(theItem).css("margin-top",(winHeight-imageHeight)/2);
	}
}

//Imagen función de modo de visualización - Tamaño de pantalla completa o normal
function ImageViewMode(theMode){
	$toolbar.data("imageViewMode", theMode);
	FullScreenBackground($bgimg,$bgimg.data("newImageW"),$bgimg.data("newImageH"));
	if(theMode=="full"){
		$toolbar_a.html("<img src='images/toolbar_n_icon.png' width='50' height='50'  />").attr("onClick", "ImageViewMode('normal');return false").attr("title", "Restore");
	} else {
		$toolbar_a.html("<img src='images/toolbar_fs_icon.png' width='50' height='50'  />").attr("onClick", "ImageViewMode('full');return false").attr("title", "Maximize");
	}
}

//funcion para encontrar el elemento Posición
	function findPos(obj) {
		var curleft = curtop = 0;
		if (obj.offsetParent) {
			curleft = obj.offsetLeft
			curtop = obj.offsetTop
			while (obj = obj.offsetParent) {
				curleft += obj.offsetLeft
				curtop += obj.offsetTop
			}
		}
		return [curtop, curleft];
	}