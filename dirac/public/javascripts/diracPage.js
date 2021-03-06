var gURLRoot = ''; // Required to set-up the proper path to the pictures.
                    // String.
var gMainLayout = false; // Main Layout object
var gPageDescription = {}; // Main object describing the page layout
function showError(msg){
  if(Ext.isEmpty(msg)){
    msg = 'Error is not set or an empty value';
  }
  alert('Error: ' + msg + '\nPlease, use the forum http://groups.google.com/group/diracgrid-forum to clarify situation');
}
function initDiracPage( urlRoot, pageDescription )
{
  if( urlRoot[ urlRoot.length - 1 ] == "/" )
    urlRoot = urlRoot.substring( 0, urlRoot.length -1 );
  gURLRoot = urlRoot;
  gPageDescription = pageDescription;
  Ext.QuickTips.init();
  Ext.namespace('dirac');
  //Check for lastLocationHash
  var lastHash = getCookie( "lastLocationHash" );
  if( lastHash )
  {
    document.location.hash = lastHash;
    var expiration = new Date();
    var nH = ( expiration.getHours() + 1 ) % 24;
    if( nH )
      expiration.setHours( nH )
    else
      expiration.setDate( expiration.getDate() + 1 );
    deleteCooke( 'lastLocationHash' );
  }
}

function renderInMainViewport( componentsList )
{
  var topFrame = initTopFrame( gPageDescription );
  var bottomFrame = initBottomFrame( gPageDescription );
  var viewportItems = [ topFrame ];
  for( var iPos = 0; iPos < componentsList.length; iPos++ )
  {
    viewportItems.push( componentsList[ iPos ] );
  }
  viewportItems.push( bottomFrame );
  gMainLayout = new Ext.Viewport( {
      layout : 'border',
      plain : true,
      items : viewportItems
    }
  );
  initNotificationsChecker();
}

function __addClickHandlerToMenuSubEntries( menuEntry )
{
  var hndlMenu = [];
  for( var i = 0; i < menuEntry.length; i++ )
  {
    if( menuEntry[i].menu )
    {
      menuEntry[i].menu = __addClickHandlerToMenuSubEntries( menuEntry[i].menu );
    }
    if( menuEntry[i].url )
    {
      menuEntry[i].handler = mainPageRedirectHandler;
    }
//    if(menuEntry[i].text == 'Delimiter')
//    {
//      menuEntry[i] = '-';
//    }
    hndlMenu.push( menuEntry[i] );
  }
  return hndlMenu;
}
function proxyUpload(){
  function winClose(){
    var win = panel.findParentByType('window');
    try{
      win.close();
    }catch(e){
      showError(e.name + ': ' + e.message)
    }
    return
  }
  function sucHandler(form, action){
    gMainLayout.container.unmask();
    var response = action.result
    if(response.success){
      if(response.success == 'false'){
        if(response.error){
          showError(response.error);
        }else{
          showError('Your request is failed with no error returned.');
        }
      }else if(response.success == 'true'){
        alert(response.result);
        winClose();
      }
    }else{
      showError('Server response is unknown. Most likely your request is accepted');
    }
  }
  function falHandler(a,b){
    gMainLayout.container.unmask();
    if(b.failureType == 'client'){
      showError('Error happens on client side');
    }else if(b.failureType == 'connect'){
      showError('Bad connection or error happens on server side while connecting');
    }else{
      showError('Error happens on server side');
    }
  }
  var close = new Ext.Button({
    cls:"x-btn-text-icon",
    handler:function(){
      winClose();
    },
    icon:gURLRoot+'/images/iface/close.gif',
    minWidth:'100',
    tooltip:'Alternatively, you can close the dialogue by pressing the [X] button on the top of the window',
    text:'Close'
  })
  var reset = new Ext.Button({
    cls:"x-btn-text-icon",
    handler:function(){
      panel.form.reset();
    },
    icon:gURLRoot+'/images/iface/reset.gif',
    minWidth:'100',
    tooltip:'Reset values in the form',
    text:'Reset'
  });
  var submit = new Ext.Button({
    cls:"x-btn-text-icon",
    handler:function(){
      gMainLayout.container.mask('Sending data');
      panel.form.submit({success:sucHandler,failure:falHandler});
    },
    icon:gURLRoot+'/images/iface/submit.gif',
    minWidth:'100',
    tooltip:'Send request to the server',
    text:'Submit'
  });
  var panel = new Ext.FormPanel({
    autoHeight:true,
    buttons:[submit,reset,close],
    defaultType:'textfield',
    defaults:{
      anchor:'-5',
      allowBlank:false
    },
    frame:true,
    fileUpload:true,
    items:[new Ext.ux.form.FileUploadField({
      buttonOffset:2,
      cls:"x-btn-text-icon",
      fieldLabel:'Certificate',
      icon:gURLRoot+'/images/iface/addfile.gif',
      listeners:{
        'fileselected':function(fb,name){
          var tt = name.substr(-4);
          if(name.substr(-4)!='.p12'){
            showError('You have to choose the *.p12 file with you credentials');
            return
          }else{
            submit.enable();
          }
        }
      }
    }),{
      allowBlank:false,
      fieldLabel:'p12 password',
      inputType:'password',
      name:'pass_p12'
    },{
      xtype:'label',
      html:'We are not keeping neither your private key nor password for'+
      ' p12 file on our service. While we try to make this process as secure'+
      ' as possible by using SSL to encrypt the p12 file with your credentials'+
      ' when it is sent to the server, for maximum security, we recommend that'+
      ' you manually convert and upload the proxy using DIRAC client commands:'+
      '<ul class="ul_disk">'+
      '<li>dirac-cert-convert.sh YOUR_P12_FILE_NAME.p12</li>'+
      '<li>dirac-proxy-init -U -g GROUP_NAME</li>'+
      '</ul><br><br>'
    }], 
    labelWidth:90,
    url:'../../info/general/proxyUpload',
  });
  var window = new Ext.Window({
    iconCls:'icon-grid',
    closable:true,
    width:400,
//    height:400,
    border:true,
    collapsible:false,
    constrain:true,
    constrainHeader:true,
    maximizable:false,
    modal:true,
    layout:'fit',
    plain:true,
    resizable:false,
    shim:false,
    title:'Proxy upload',
    items:[panel]
  });
  window.show();
  return
}
function regForm(dn,cn){
  if(Ext.isEmpty(dn)){
    showError('You have to load certificate to browser before register');
    return
  }
  function winClose(){
    var win = panel.findParentByType('window');
    try{
      win.close();
    }catch(e){
      showError(e.name + ': ' + e.message)
    }
    return
  }
  function sucHandler(form, action){
    gMainLayout.container.unmask();
    var response = action.result
    if(response.success){
      if(response.success == 'false'){
        if(response.error){
          showError(response.error);
        }else{
          showError('Your request is failed with no error returned.');
        }
      }else if(response.success == 'true'){
        if(Ext.isEmpty(response.result)){
          response.result = 'Your request has been successfully registered\nInstructions';
          response.result = response.result + ' will be sent to your e-mail address shortly'
        }
        alert(response.result);
        winClose();
      }
    }else{
      showError('Server response is unknown. Most likely your request is accepted');
    }
  }
  function falHandler(a,b){
    gMainLayout.container.unmask();
    if(b.failureType == 'client'){
      showError('Error happens on client side');
    }else if(b.failureType == 'connect'){
      showError('Bad connection or error happens on server side while connecting');
    }else{
      showError('Error happens on server side');
    }
  }
  var close = new Ext.Button({
    cls:"x-btn-text-icon",
    handler:function(){
      winClose();
    },
    icon:gURLRoot+'/images/iface/close.gif',
    minWidth:'100',
    tooltip:'Alternatively, you can close the dialogue by pressing the [X] button on the top of the window',
    text:'Close'
  })
  var reset = new Ext.Button({
    cls:"x-btn-text-icon",
    handler:function(){
      panel.form.reset();
    },
    icon:gURLRoot+'/images/iface/reset.gif',
    minWidth:'100',
    tooltip:'Reset values in the form',
    text:'Reset'
  });
  var submit = new Ext.Button({
    cls:"x-btn-text-icon",
    handler:function(){
      gMainLayout.container.mask('Sending registration data');
      panel.form.submit({success:sucHandler,failure:falHandler});
    },
    icon:gURLRoot+'/images/iface/submit.gif',
    minWidth:'100',
    tooltip:'Send request to the server',
    text:'Submit'
  });
  var country = {fieldLabel:'Country',name:'country',emptyText:'Select your country'};
  if(pageDescription['regCountries']){
    var country = new Ext.form.ComboBox({
      displayField:'name',
      emptyText:'Select your country',
      fieldLabel:'Country',
      store:new Ext.data.SimpleStore({fields:['name'],data:pageDescription['regCountries'],sortInfo:{field:'name',direction:'ASC'}}),
      typeAhead:true,
      mode:'local',
      name:'country',
      forceSelection:true,
      triggerAction:'all',
      selectOnFocus:true,
    });
  }
  var voList = {fieldLabel:'Virtual Organization',name:'vo',emptyText:'Select preferred virtual organization(s)'};
  if(pageDescription['regVO']){
    var voList = new Ext.ux.form.LovCombo({
      displayField:'data',
      emptyText:'Select preferred virtual organization(s)',
      fieldLabel:'Virtual Organization',
      hiddenName:'vo',
      hideOnSelect:false,
      id:Ext.id(),
      mode:'local',
      resizable:true,
      separator:',',
      store:new Ext.data.SimpleStore({fields:['data'],data:pageDescription['regVO'],sortInfo:{field:'data',direction:'ASC'}}),
      triggerAction:'all',
      typeAhead:true,
      valueField:'data'
    });
  }
//  var panel = new Ext.form.FormPanel({
  var panel = new Ext.FormPanel({
    autoScroll:true,
    baseParams:{'registration_request':'true'},
    bodyStyle:'padding: 5px',
    border:false,
    buttonAlign:'center',
    buttons:[submit,reset,close],
    defaultType:'textfield',
    defaults:{
      anchor:'-25'
    },
    items:[
      {xtype:'hidden',name:'dn',value:dn},
      {xtype:'hidden',name:'cn',value:cn},
      {fieldLabel:'Full Name',name:'full_name',allowBlank:false,emptyText:'John Smith'},
      {fieldLabel:'Username',name:'user_name',emptyText:'jsmith'},
      {fieldLabel:'Email',name:'email',vtype:'email',allowBlank:false,emptyText:'john.smith@gmail.com'},
      {fieldLabel:'Phone number',name:'phone',emptyText:'+33 9 10 00 10 00'},
      country,voList,
      {fieldLabel:'Comments',name:'comment',xtype:'textarea',emptyText:'Any additional information you want to provide to administrators'}
    ],
    keys:[{
      key:13,
      scope:this,
      fn:function(key,e){
        gMainLayout.container.mask('Sending registration data');
        panel.form.submit({success:sucHandler,failure:falHandler});
      }
    }],
    labelAlign:'top',
    method:'POST',
    url:'../../info/general/action',
    waitMsgTarget:true  
  });
  var window = new Ext.Window({
    iconCls:'icon-grid',
    closable:true,
    width:800,
    height:400,
    border:true,
    collapsible:false,
    constrain:true,
    constrainHeader:true,
    maximizable:true,
    modal:true,
    layout:'fit',
    plain:true,
    shim:false,
    title:'Registration form for ' + dn,
    items:[panel]
  });
  window.show();
}
function helpEntry(){
  var url = 'http://marwww.in2p3.fr/~atsareg/Docs/DIRAC/build/html/diracindex.html';
  if(gPageDescription.helpURL){
    url = gPageDescription.helpURL
  }
  var html = '<iframe id="help_frame" src =' + url + '></iframe>';
  var panel = new Ext.Panel({border:0,autoScroll:false,html:html});
  panel.on('resize',function(){
    var wwwFrame = document.getElementById('help_frame');
    wwwFrame.height = panel.getInnerHeight() - 4;
    wwwFrame.width = panel.getInnerWidth() - 4;
  });
  var title = 'Help for ' + gPageDescription.pagePath;
  var window = new Ext.Window({
    iconCls:'icon-grid',
    closable:true,
    width:800,
    height:400,
    border:true,
    collapsible:false,
    constrain:true,
    constrainHeader:true,
    maximizable:true,
    modal:true,
    layout:'fit',
    plain:true,
    shim:false,
    title:title,
    items:[panel]
  });
  window.show();
}
function initTopFrame( pageDescription ){
  var navItems = [];
  for( var i in pageDescription[ 'navMenu' ] ){
    areaObject = pageDescription[ 'navMenu' ][i];
    if(areaObject.text){
      var handleredMenu = __addClickHandlerToMenuSubEntries( areaObject.menu );
      var cnfObj = { text : areaObject.text, menu : handleredMenu };
      if(areaObject.text == 'Info'){
        cnfObj.cls = 'x-btn-icon';
        cnfObj.icon = gURLRoot+'/images/iface/dlogo.gif';
        cnfObj.minWidth = '16';
        delete cnfObj.text;
      }
      if(cnfObj.text == 'Help'){
        cnfObj.menu.reverse();
        var tmp = new Array();
        tmp.text = 'Context Help';
        tmp.handler = helpEntry;
        cnfObj.menu.push(tmp);
        cnfObj.menu.reverse();
      }
      var menuEntry = new Ext.Toolbar.Button( cnfObj );
    }
    navItems.push( menuEntry );
  }
  if(gPageDescription.userData && gPageDescription.userData.username && gPageDescription.userData.username != 'Anonymous'){
    var upmenu = new Ext.menu.Menu({
      items:[{
        handler:function(){
          loadFile({
            '/stylesheets/fileupload.css':'css',
            '/javascripts/FileUploadField.js':function(){proxyUpload()}
          });
        },
        text:'Proxy Upload'
      },{
        handler:function(){
          loadFile({
            '/stylesheets/fileupload.css':'css',
            '/javascripts/FileUploadField.js':null,
            '/stylesheets/lovCombo.css':'css',
            '/javascripts/lovCombo.js':null,
            '/javascripts/jobs/Launchpad.js':function(){
              submitJobNew()
            }
          });
        },
        text:'Job Launchpad'
      }]
    });
    var tools = new Ext.Toolbar.Button({
      text:'Tools',
      id:'mainTopbarToolsButton',
      menu:upmenu
    });
    navItems.push(tools);
  }
  navItems.push( "->" );
  navItems.push( "Selected setup:" );
  // Set the handler
  for( var i = 0; i< pageDescription[ 'setupMenu' ].length; i++ )
  {
	  pageDescription[ 'setupMenu' ][i].handler = redirectWithHashHandler;
  }
  var setupButton = new Ext.Toolbar.Button({
    text : pageDescription[ 'selectedSetup' ],
    menu : pageDescription[ 'setupMenu' ]
  });
  navItems.push( setupButton );
  if( 'voIcon' in pageDescription && pageDescription[ 'voIcon' ] )
  {
	  var iconLogo = '<a href=' + pageDescription[ 'voURL' ]  + ' target="_blank">'
	  var iconLocation = pageDescription[ 'voIcon' ]
	  while( iconLocation[0 ] == "/" )
		  iconLocation = iconLocation.substring( 1, iconLocation.length );
	  var iconLocation = gURLRoot+"/"+iconLocation;
	  iconLogo = iconLogo + '<img src="' + iconLocation + '"/></a>'
	  navItems.push( iconLogo )
  }
  var topBar = new Ext.Toolbar({
    id:'diracTopBar',
    region:'north',
    items : navItems
  });
  return topBar
}

function initBottomFrame( pageDescription )
{
  var navItems = [ pageDescription['pagePath'], '->', { 'id' : 'mainNotificationStats', 'text' : '' }, "-" ];
  var userObject = pageDescription[ 'userData' ];
  var regex = new RegExp('certificate login',i);
  if(userObject.DN && !regex.test(userObject.DN) &&userObject.username && userObject.username.toLowerCase() == 'anonymous'){
    Ext.Ajax.request({
      method:'POST',
      params:{'getCountries':true},
      success:function(response){
        var response = Ext.util.JSON.decode(response.responseText);
        if(response.result){
          var result = response.result;
          pageDescription['regCountries'] = [];
          for(var i in result){
            pageDescription['regCountries'].push([result[i]]);
          }
        }
      },
      url:'../../info/general/action'
    });
    Ext.Ajax.request({
      method:'POST',
      params:{'getVOList':true},
      success:function(response){
        var response = Ext.util.JSON.decode(response.responseText);
        if(response.result){
          var result = response.result;
          pageDescription['regVO'] = [];
          for(var i=0;i<result.length;i++){
            pageDescription['regVO'].push([result[i]]);
          }
        }
      },
      url:'../../info/general/action'
    });
    var register = new Ext.Toolbar.Button({
      handler:function(){
        var cn = "undefined"
        if(!Ext.isEmpty(userObject.CN)){
          cn = userObject['CN'];
        }
        loadFile({
            '/stylesheets/lovCombo.css':'css',
            '/javascripts/lovCombo.js':function(){
              regForm(userObject.DN, cn)
            }
        });
      },
      text:'<b>Click here to register in DIRAC</b>',
      tooltip:''
    });
    navItems.push(register);
  }else{
    if( userObject.group ){
    	navItems.push( userObject[ 'username' ]+"@" );
    	// Set the handler
    	for( var i = 0; i< userObject.groupMenu.length; i++ )
    	{
    		userObject.groupMenu[i].handler = redirectWithHashHandler;
    	}
      var userGroupMenu = new Ext.Toolbar.Button({
        text : userObject.group,
        menu : userObject.groupMenu
      });
      navItems.push( userGroupMenu );
    }else{
    	navItems.push( userObject[ 'username' ] );
    }
    navItems.push( "("+userObject.DN+")" );
  }
  var bottomBar = new Ext.Toolbar({
    region:'south',
    id:'diracBottomBar',
    items : navItems
  });
  return bottomBar;
}

function mainPageRedirectHandler( item, a, b )
{
  window.location = item.url;
}

function redirectWithHashHandler( item )
{
	var newLocation = item.url;
	var queryString = window.location.search.substring(1);
	if( queryString )
		newLocation += "?" + queryString;
	if( document.location.hash )
	{
	  var expiration = new Date();
    var nH = ( expiration.getHours() + 1 ) % 24;
    if( nH )
      expiration.setHours( nH )
    else
      expiration.setDate( expiration.getDate() + 1 );
		setCookie( "lastLocationHash", document.location.hash, expiration, gURLRoot || "/" );
	}
	
	window.location = newLocation;
}


// Cookie utilities
function setCookie( cookieName, value, expirationDate, path, domain, secure )
{
  var cookie_string = cookieName + "=" + escape ( value );

  if ( expirationDate )
  {
    cookie_string += "; expires=" + expirationDate.toGMTString();
  }

  if ( path )
        cookie_string += "; path=" + escape ( path );

  if ( domain )
        cookie_string += "; domain=" + escape ( domain );
  
  if ( secure )
        cookie_string += "; secure";
 
  document.cookie = cookie_string;
}


function getCookie( cookieName )
{
  var matchResults = document.cookie.match ( '(^|;) ?' + cookieName + '=([^;]*)(;|$)' );
  if ( matchResults )
    return ( unescape ( matchResults[2] ) );
  else
    return null;
}

function deleteCooke( cookieName )
{
  document.cookie = cookieName + '=;expires=Thu, 01-Jan-1970 00:00:01 GMT';
}

function loadFile(data){
  if(!data) return;
  var addLoadHandler = function(script, data){
    script.onload = script.onreadystatechange = function( ){
      if(!script.readyState || script.readyState == "loaded" || script.readyState == "complete"){
        if(typeof data == "function") data( );
        script.onload = script.readystatechange = null; 
      }
    }
  }
  var head = document.getElementsByTagName("head")[0];    
  for(file in data){
    if(data.hasOwnProperty(file)){
      if(data[file] == 'css'){
        var el = document.createElement('link');
        el.setAttribute('type','text/css');
        el.setAttribute('rel','stylesheet');
        el.setAttribute('href',gURLRoot+file);
      }else{
        var el = document.createElement('script');
        el.setAttribute('type','text/javascript');
        el.setAttribute('src',gURLRoot+file);
        addLoadHandler(el, data[file]);
      }
      head.appendChild(el);
    }
  }  
}
