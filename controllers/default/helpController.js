/**
 * Помощь
 */
Ext.ns('Application.controllers.defaultModule');

Application.controllers.defaultModule.HelpController = Ext.extend(Application.controllers.Abstract, {
  title         : 'Помощь',

  indexAction   : function (params, app, panel) {
    panel.add({
      //xtype       : 'Application.components.actionPanel',
      xtype       : 'Application.components.fullscreenPanel',
      cmpType     : 'Application.components.ContentViewBase',
      //title       : 'Помощь',
      sameResourceActivationBypass: true,
      cmpEvents   : ['paramschanged'],
      //header      : false,
      //width       : '90%',
      cmpParams   : {
        editable      : false,
        selection     : params,
        baseUrl     : 'help/index/'
      }
    });
  }

}); // Application.controllers.HelpController
