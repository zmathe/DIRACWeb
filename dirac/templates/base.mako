# -*- coding: utf-8 -*-
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<%
import dirac.lib.credentials as credentials
import dirac.lib.webBase as webBase

credentials.checkUserCredentials()

pageTitle = webBase.htmlPageTitle()
%>
<html>
 <head>
  <title>DIRAC: ${ pageTitle }</title>
  <link rel="SHORTCUT ICON" href='${ h.url_for( "/images/favicon.ico" )}'>
  ${ h.stylesheet_link( "/yui/reset-fonts-grids/reset-fonts-grids.css" ) }
  ${ h.stylesheet_link( "/stylesheets/dirac.css" ) }
  <!-- Font size -->
  ${ h.stylesheet_link( "/yui/fonts/fonts-min.css" ) }
  <!-- Yui skins -->
  ${ h.stylesheet_link( "/yui/menu/assets/skins/sam/menu.css" ) }
  <!-- js -->
  ${ h.javascript_link( "/yui/yahoo-dom-event/yahoo-dom-event.js" ) }
  ${ h.javascript_link( "/yui/container/container_core-min.js" ) }
  ${ h.javascript_link( "/yui/yahoo/yahoo-min.js" ) }
  ${ h.javascript_link( "/yui/event/event-min.js" ) }
  ${ h.javascript_link( "/yui/menu/menu.js" ) }
  <!-- init YUI -->
  <script>
<%
areaContentsDict = {}
areasList = []
for area in webBase.schemaAreas():
  areaContentsDict[ area ] = webBase.jsSchemaSection( area, area )
  if len( areaContentsDict[ area ] ) > 2:
    areasList.append( area )
%>
   function initMenuBar() {
% for area in areasList:
     var ${area}Items = ${ areaContentsDict[ area ] }
     var o${area}Menu = new YAHOO.widget.Menu( "${area}TopLevelMenuObjectDiv", { itemdata : ${area}Items } );
     var ret = o${area}Menu.render( '${area}MenuAnchor' );
     o${area}Menu.showEvent.subscribe( function () { this.focus(); } );
     function show${area}Menu( e ) {
% for otherAreas in areasList:
% if otherAreas != area:
       o${otherAreas}Menu.hide()
% endif
% endfor
       //HACK: YUI insists on positioning this element in top 10px left 10px
		 o${area}Menu.cfg.setProperty( 'x', YAHOO.util.Dom.getX( '${area}MenuAnchor' ) );
		 o${area}Menu.cfg.setProperty( 'y', YAHOO.util.Dom.getY( '${area}MenuAnchor' ) + YAHOO.util.Dom.get( '${area}MenuAnchor' ).offsetHeight );
       o${area}Menu.show();
     };
     YAHOO.util.Event.addListener( document.getElementById( '${area}Position' ), 'click', show${area}Menu );
     YAHOO.util.Event.addListener( document.getElementById( '${area}Position' ), 'mouseover', show${area}Menu );
% endfor
   }
   //YAHOO.util.Event.onContentReady( "pageMenuBar", initMenuBar );
   YAHOO.util.Event.onDOMReady( initMenuBar );
  </script>
  ${self.head_tags()}
 </head>
 <body class='yui-skin-sam'>
  <div class='topUserShortcuts'>
   ${webBase.htmlShortcuts()}
  </div>
  <div class='topUserInfo'>
   ${webBase.htmlUserInfo()}
  </div>
  <hr class='pageHorizontalDelimiter'/>
  <table class='header'>
   <tr>
    <td>${ h.image_tag( 'DIRAC.png', alt = 'DIRAC' ) }</td>
    <td class='headerSpacer'></td>
    <td>${ h.image_tag( 'LHCbLogo.png', alt = 'LHCb' ) }</td>
   </tr>
  </table>
  <table id='pageMenuBar' class='menuBar'>
   <tr>
    ${ webBase.htmlSchemaAreas( areasList ) }
    <td class='menuSetup'>
       Selected Setup
    </td>
    <td class='menuSetupChoice'>
     ${ webBase.htmlSetups() }
    </td>
   </tr>
   <tr>
    <td colspan='${ len( webBase.schemaAreas() ) + 2 }' class='menuPath'>
     ${ webBase.htmlPath() }
    </td>
   </tr>
  </table>
  ${self.body()}
<script type="text/javascript">
var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
</script>
<script type="text/javascript">
var pageTracker = _gat._getTracker("UA-2149799-2");
pageTracker._initData();
pageTracker._trackPageview();
</script>
  </div>
 </body>
</html>

