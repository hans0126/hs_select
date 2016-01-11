// JavaScript Document
//製作者:Hans
//日期：2012-07-19
//套件介紹：自訂義select下拉式選單
//修改: 2012-09-21
//修改: 2012-09-25 多重樣式
//修改: 2013-01-17 multi Ajax  
//修改： 2013-03-20 動態屬性
//修改： 2013-06-13 scrollbar 
//修改： 2013-08-20 icon 
//修改： 2013-10-23 fix drag 
$.fn.hs_select = function(options) {
	
	/*偵測function 是否載入*/
	
	if (!$.isFunction($.fn.draggable)) {
		alert('請載入draggable套件!!');
		return false;
	}
	
	if (!$.isFunction($.fn.mousewheel)) {
		alert('請載入mousewheel套件!!');
		return false;
	}
	
	
	
	var defaults = {
		//滑鼠按下事件
      	clickEvent:null,//滑鼠選中時 function(選中的值){}
      	insertElement:function(obj,title,icon){
					 var icon_url='';
					 if(icon){
						 icon_url="<img src='"+icon+"'/>";
					 }
					 return "<li "+insertOtherValue(obj)+">"+icon_url+title+"</li>";
					 },
		closeDelay:200,//離開區塊幾秒後關起來
		closeEffect:'fadeOut',//收合時的效果
		closeEffectSpeed:'fast',//收合時的速度
		openEffect:'slideDown',//展開時的效果
		openEffectSpeed:'fast',////展開時的速度
		theme:'sp_selecter',//樣式		
		
		default_value_text:'-select-',//
		default_choice:true,//是否預先選取第一個項目
		
		dataListHeight:null,//下拉選單高度				
		ul_width_tuning:0,//寬度微調
		li_padding:0,		
		
		footer_corner:false,//是否使用底部圓角
		arr_multi_select:[],//關聯式下拉是選單		
		attrValue:['va'],//傳值的名稱預設['va']
		type:"GET",
		dropdown_tuning:0, //下拉式區域的高度位置微調
		track_width:20,
		drag_content:null,
		position_range:15, //滑鼠滾輪的位移間隔
		data_reverse:false, //資料列上下翻轉
		drag_height_fix:true,//是否fix drag高度 
		drag_height:40//fix drag 高度
    };
	
	
	var set=$.extend(defaults,options);	
	var objThis=$(this);
	
	//判斷attr是否定義
	/*if(set.attrValue.length<1){
		set.attrValue[0]='va';
	}*/
	
	//插入attrValue，insertElement調用
	function insertOtherValue(obj){
		
		var return_text='';
		
		for(key in obj){							        		
			return_text+=key+"='"+obj[key]+"' ";
							        	
		}                 	
             
        return return_text;		
		
	}
	
	//arrToObj
	function arrToObj(targetObj){
    	
    	var dataValue={};     
    	
    	var dataValueName=set.attrValue;      	
    	
    	for(var i=0; i<dataValueName.length; i++){    		
    		  if(typeof(targetObj.attr(dataValueName[i]))!='undefined'){    		  				  	
    		  		dataValue[dataValueName[i]]=targetObj.attr(dataValueName[i]);     		  			
    		  }        		
    	}    	
    	
    	return  dataValue;		
	}
	
	
	var unitCount=this.length;
	return this.each(function(i) {	
		
		var $this=$(this);			
		var temp_body='';	
		
		var default_title='';
		var default_value='';
		var default_icon;
		//var thisId='';
		var thisName='';
		var default_title='';
		var has_default_choice=false;			
		
		var thisId = ($this.attr('id')) ? "id='"+$this.attr('id')+"'" : '';
		var thisName = ($this.attr('name')) ? "name='"+$this.attr('name')+"'" : '';
		var default_title_value= (typeof($this.attr("default_value"))!='undefined') ?$this.attr("default_value"):set.default_value_text;
	
		
		//建立html碼
		temp_body+="<div "+thisId+" class='sp_select "+set.theme+"' style='' default_title='"+default_title_value+"'>";
		temp_body+="<input "+thisName+" type='hidden' value='0' />";	
		temp_body+="<div class='select_arrow'></div>";	
		temp_body+="<div class='left main_part'></div>";
		temp_body+="<div class='center sp_selecterInput main_part'></div>";
		temp_body+="<div class='right main_part' ></div>";
		temp_body+="<div class='select_listdata_area' style='display:none'>";
		temp_body+="<ul >";	
		if($.isFunction(set.insertElement)){	
			$('> option',$this).each(function(){			
				if($(this).attr('selected')){
					has_default_choice=true;
					default_title=$(this).text();
					default_value=$(this).val();
					default_icon=$(this).attr('icon_url');
					
				}
				
				var insert_element_obj={};
				var icon_url;
				insert_element_obj[set.attrValue[0]]=$(this).val();				
				//處理須抓取的資料屬性值
				for(var i=1; i<set.attrValue.length; i++){
					
					var insert_value='';					
					if(typeof($(this).attr(set.attrValue[i]))!='undefined'){
						insert_value=$(this).attr(set.attrValue[i]);						
					}										
					insert_element_obj[set.attrValue[i]]=insert_value;
					
				}
				//抓取icon_url屬性
				if(typeof($(this).attr('icon_url'))!='undefined'){
					icon_url=$(this).attr('icon_url');
					
				}
							
				temp_body+=set.insertElement(insert_element_obj,$(this).text(),icon_url);
			})
		}
		
		temp_body+="</ul>";
		if(set.footer_corner){		
			temp_body+="<div class='select_footer'><div class='footer_left'></div><div class='footer_center'></div><div class='footer_right'></div></div>";
		}
		
		temp_body+="</div></div>";	
		
		$newThis=$(temp_body).insertAfter($this);
	
		//沒有預選選項以及要使用預選
		if(!has_default_choice){		
			if(set.default_choice){
				
				default_value=$("ul > li",$newThis).eq(0).attr(set.attrValue[0]);
				default_title=$("ul > li",$newThis).eq(0).text();
				default_icon=$("ul > li ",$newThis).eq(0).children('img').attr('src');
				
				if(typeof(default_value)=='undefined'){	
					default_value=0;
				}
				
				if(typeof(default_title)=='undefined'){	
					default_title=default_title_value;
				}				
					
			}else{
				default_value=0;
				default_title=default_title_value;
			}			
		}		
		
		if(default_title==''){
			default_title=default_title_value;
		}
		
		if(default_value==''){
			default_value=0;	
		}
		
		$('input[type=hidden]',$newThis).val(default_value);
		$('>.center',$newThis).text(default_title);
		if(default_icon){
			$('>.center',$newThis).prepend("<img src='"+default_icon+"'>");	
		}
		
		
		var overflow_value=$("> .left",$newThis).width()+$("> .right",$newThis).width();			
		$newThis.find('.center').width($this.width()-overflow_value-(set.li_padding));
		
		//刪除原本的select
		$this.remove();
		
		style_init($newThis);
		
		//物件產生完畢 first ajax init
		if(unitCount==i+1){
			
			var arr_multi_select=set.arr_multi_select;
			var arr_multi_select_count=arr_multi_select.length;
		
			for(var kk=0; kk<arr_multi_select_count; kk++){			
				ajaxMulti(arr_multi_select[kk]);
				
			}
		}	
		
	})
	
	
	//物件樣式	
	function style_init(obj,old){
	//定義樣式長寬
		
		
		var limit_count=(set.footer_corner) ? 1:0; 
		
		var objCount=$('.select_listdata_area ul > li',obj).length;
		var _optionAreaOpen=false;
		var hh=obj.height();		
		var	temp_width=obj.width();		
		var maxHeight;	
		
		//文字區域的寬度=總長-前面圖片-後面圖片
		if(!old){
			var _centerW=obj.width()-$('.left',obj).width()-$('.right',obj).width();
		}else{
			var _centerW=$("> .center",obj).width();
		}
			
		$('.center',obj).width(_centerW);
		
		var ulPx=0;
		var ulWidth=obj.width()+set.ul_width_tuning;
		
		if(set.dataListHeight){
			maxHeight=set.dataListHeight+'px';
		}else{
			maxHeight="auto";
		}
		
		
		$('ul',obj).css({'max-height':maxHeight});
		//var select_listdata_area_height=obj.find('.select_listdata_area').height();
		var select_listdata_area_height;
		if(set.data_reverse){
			select_listdata_area_height=(obj.find('.select_listdata_area').height())*-1;	
		}else{
			select_listdata_area_height=hh+set.dropdown_tuning;
		}
		
		obj.find('.select_listdata_area').css({'top':(select_listdata_area_height),
								'left':ulPx+'px',							
								'width':ulWidth+'px',								
								'padding-top':(0)+'px'});
		
		obj.find('li').css({'width':(ulWidth-(set.li_padding*2))+'px',
								'padding-left':set.li_padding+'px',
								'padding-right':set.li_padding+'px'});
		
		obj.find('.select_footer').css({'width':ulWidth+'px',
											'padding-left':'0px',
											'padding-right':'0px'
											});
											
		
		
		//處理scrollbar
		var area_height=$('.select_listdata_area',obj).show().children('ul')[0].scrollHeight;
		$('.select_listdata_area',obj).hide();
		
		if(set.dataListHeight){	
					
				if(area_height > set.dataListHeight){	
					
					var drag_content='';
					if($.isFunction(set.drag_content)){
						drag_content=set.drag_content();
					}
				
					
					$('.select_listdata_area',obj).append('<div class="track"><div class="drag">'+drag_content+'</div></div>');
					
					
					//判斷是否fix drag
					
					if(set.drag_height_fix){
						$('.drag',obj).height(set.drag_height);						
					}else{
						var height_range=area_height / set.dataListHeight;
						$('.drag',obj).height($('.track',obj).height()/height_range);
					}	
					
					/*drag*/
					$('.drag',obj).draggable({
						 axis: "y",
						 drag:function (event,ui){				 	
								//控制 drag							
								if(ui.position.top<0){
									ui.position.top=0;
								}							
								
								if(ui.position.top+$(this).height()>=$('.track',obj).height()){
									ui.position.top=$('.track',obj).height()-$(this).height();	
								}					
								//控制內容					
								var this_ul=$('.select_listdata_area > ul',obj);
								if(set.drag_height_fix){
									//移動百分比									
									var pOfP=Math.floor((ui.position.top/(set.dataListHeight-set.drag_height))*100);			
									
									var this_li=this_ul.children('li');
									//ul總高度-1i個數乘上下內距-drag height
									//var ulRealHeight=this_ul.prop("scrollHeight")-this_li.length*(parseFloat(this_li.css("padding-top"))+parseFloat(this_li.css("padding-top")))-set.drag_height;							
									var ulRealHeight=this_ul.prop("scrollHeight")-set.dataListHeight;											
									
									
									this_ul.scrollTop((ulRealHeight/100)*pOfP);		
																
								}else{
									this_ul.scrollTop(ui.position.top*height_range);
								}
						 }
						 
					});						
					
					/*mouse wheel*/
					$('.select_listdata_area > ul',obj).mousewheel(function(event,delta){
						var now_position=$('.drag',obj).position().top;
						var this_drag=$('.drag',obj)
						if(delta>0){					
							if(now_position-set.position_range<=0){
								this_drag.css('top',0);	
							}else{					
								this_drag.css('top',now_position-set.position_range);	
							}
							
						}else{
							if(now_position+$('.drag',obj).height()+set.position_range>=$('.track',obj).height()){
								this_drag.css('top',$('.track',obj).height()-$('.drag',obj).height());
							}else{
								this_drag.css('top',now_position+set.position_range);
							}
						}
						
						
						var this_ul=$('.select_listdata_area > ul',obj);		
						var this_li=this_ul.children('li');
						
						
						if(set.drag_height_fix){
							var pOfP=Math.floor(($('.drag',obj).position().top/(set.dataListHeight-set.drag_height))*100);													
							var ulRealHeight=this_ul.prop("scrollHeight")-set.dataListHeight;
							this_ul.scrollTop(ulRealHeight/100*pOfP);							
						}else{						
							this_ul.scrollTop(this_drag.position().top*height_range);
						}
						
						return false;
					})
							
													
					$('.select_listdata_area > ul > li',obj).width($('.select_listdata_area',obj).width()-set.track_width-(set.li_padding*2));				
				}		
			}
		
		
		/**/
		$(obj).unbind('hover');			
		obj.hover(function(){			
			if(_optionAreaOpen ){
								
				var thisUl=$(this).find('.select_listdata_area');				
				thisUl.delay(set.closeDelay).queue(fn_closeEffect(thisUl,set.closeEffect,set.closeEffectSpeed));				
				_optionAreaOpen=false;
				$(this).removeClass('this');
			}
		})	
		
		var obj_div=$('> div',obj);
		
		obj_div.unbind('click');
		obj_div.click(function(){	
			//處理階層
			
			$(document).find('.'+set.theme).css('z-index','500');
			$(this).parent().css('z-index','600');			
													 
			if(!_optionAreaOpen ){
				obj.addClass('this');
				var thisUl=$(this).parent().find('.select_listdata_area');
				
				thisUl.queue(fn_openEffect(thisUl,set.openEffect,set.openEffectSpeed));		
				_optionAreaOpen=true;				
			}
		})
	
		//當按鈕選定時
		var obj_li=$('ul > li',obj);
		obj_li.click(function(){		
			var icon_url=$(this).children('img').attr('src');
			var dropArea=$('div.select_listdata_area',obj);
			$('.sp_selecterInput',obj).text($(this).text());	
			$('input[type=hidden]',obj).val($(this).attr(set.attrValue[0]));	
			
			if($.isFunction(set.clickEvent)){
				//set.clickEvent($(this).attr(set.attrValue[0]),$(this));
				//arrToObj;
				var return_value=$(this).attr(set.attrValue[0]);
				
				if(set.attrValue.length > 1){
					return_value=arrToObj($(this));
				}
								
				set.clickEvent(return_value,obj);
			}
			
			if(typeof(icon_url)!='undefined'){	
				$('.sp_selecterInput',obj).prepend("<img src='"+icon_url+"'>");						
			}
			
				
			
			dropArea.delay(set.closeDelay).queue(fn_closeEffect(dropArea,set.closeEffect,set.closeEffectSpeed));				
			_optionAreaOpen=false;
			obj.removeClass('this');
			return false;
			
		});
		
		
	}
	
	//收合效果
	function fn_closeEffect(obj,effect,speed){
		
		switch(effect){
			case 'slideUp':						
				obj.slideUp(speed);
			break;
			
			case 'fadeOut':						
				obj.fadeOut(speed);
			break;
			
			case 'hide':
				obj.hide(speed);
			break;
			
			default:				
				obj.slideUp(speed);			
		}					
	}
	
	//開啟效果
	function fn_openEffect(obj,effect,speed){
	
		switch(effect){
			case 'slideDown':						
				obj.slideDown(speed);
			break;
			
			case 'fadeIn':						
				obj.fadeIn(speed);
			break;
			
			case 'show':
				obj.show(speed);
			break;
			
			default:
				obj.slideDown(speed);
			
		}					
	}	
	
	//Ajax
	function ajaxMulti(arr_multi_select){		
		//alert(set.arr_multi_select[0].target_info.length);
		var currentObj=$(arr_multi_select['current']);
		
		$('ul > li',currentObj).click(function(){
			
			relationSelectRest(currentObj);	
			for(var i=0;i<arr_multi_select['target_info'].length;i++){			
				var targetObj=$(arr_multi_select['target_info'][i].target);
				var targetUrl=arr_multi_select['target_info'][i].url;									
				ajax_init($(this),currentObj,targetObj,targetUrl);		
			}	
		})	
	}
	
	function ajax_init(datas,currentObj,targetObj,targetUrl){		
			relationSelectRest(targetObj);	
			$.ajax({
			  dataType: "json",
			  type: set.type,
			 
			  url: targetUrl,
			  async:true,
			  data:arrToObj(datas),
			  success: callbackProcess				  	
			});	
			
			function callbackProcess(data){				
			
				//產生內容					
				var callContent='';					
			
				for(var i=0;i<data.length;i++){					
					callContent+=set.insertElement(data[i].value,data[i].title);				
				}					
				
				$(' ul',targetObj).append(callContent);				
				
				style_init(targetObj,true);	
				
				if(data.length<1 ){
					$('div.center',targetObj).html('----------------');
				}
				
				
				for(var zz=0; zz<set.arr_multi_select.length; zz++){			
							
					if(set.arr_multi_select[zz]['current']==('#'+targetObj.attr('id'))){
							ajaxMulti(set.arr_multi_select[zz]);
					}								
				}	
				
			}			
	}	
	//重置
	function selectReset(obj){
	
		$('ul > li',obj).remove();		
		$('> .center',obj).text(obj.attr('default_title'));
		$('input[type=hidden]',obj).val('');
		
		/*scroll reset*/
		$('.drag',obj).unbind('draggable');
		$('.select_listdata_area > ul',obj).unbind('mousewheel');
		$('.track',obj).remove();
					
	}	
	//關連重置(遞回)
	function relationSelectRest(obj){//obj 當前被選擇物件
		
		for(var i=0; i<set.arr_multi_select.length; i++){
			
			if(('#'+obj.attr('id'))==set.arr_multi_select[i].current){
				
				for(var j=0;j<set.arr_multi_select[i].target_info.length;j++){						
					var clearObj=$(set.arr_multi_select[i].target_info[j].target);
					relationSelectRest(clearObj);
					selectReset(clearObj);
					
				}
					
			}
			
		}
		
	}
	
};