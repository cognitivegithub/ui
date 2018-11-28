/**
 * Компонент отображает файлопанель в профилях.
 * Параметры:
 * file_panels: массив объектов типа:
 *    name - title панели
 *    descr - описание того что нужно прикреплять
 *    req_id - уникальный номер панели
 *    withDescr - с полем для ввода описания или нет
 *    required - обязательно поле или нет
 */

Application.components.FilesPanelMU = Ext.extend(Ext.Panel, {
  initComponent: function() {
    var filetypes = [], component = this;
    
    for(var j=0, n=component.file_panels.length; j<n; ++j) {
      // making closure
      (function(i) {
        var current = component.file_panels[i];
        current.required = (current.name=='Прочие документы') ? false : true;
        filetypes.push({
          title: current.name,
          frame: true,
          cls: 'spaced-bottom',
          items: [{
            cls: 'spaced-panel',
            style: 'font-size: 9px',
            hidden: (undefined===current.descr || current.descr.length==0),
            html: current.descr
          },{
              xtype: 'Application.components.multiuploadPanel',
              name: (current.req_id) ? component.cmptype+'_docs_'+current.req_id+'' : component.cmptype+'_docs',
              uploadHandler: component.uploadHandler,
              deleteHandler: component.deleteHandler,
              autoUpload: true,
              required: current.required,
              listeners : {
                beforeupload : function(cmp) {
                  cmp.uploadParmas = {};
                  cmp.uploadParams.contragent_id = component.contragent_id;
                  if(current.req_id) {
                    cmp.uploadParams.requirement_id = current.req_id;
                  }
                  cmp.uploadParams.doctype = component.cmptype+'_files';
                }
              }
            }, 
            {
              border: false,
              hideTitle: true,
              html: ACCEPTED_FILES
            }
        ]
        });
      })(j);
    }
    Ext.apply(this, {
      frame: false,
      items: filetypes,
      setValues : function(v) {
        setComponentValues(this, v, false); 
      }
    });
    Application.components.FilesPanelMU.superclass.initComponent.call(this);
  }
});