/**
 * Компонент отображает файлопанель.
 * Параметры:
 * is_panel: true - выводить панель, false - fieldset
 * // alena 2014.04.29 параметр onlyOne используется, когда можно загрузить только один файл.
 * onlyOne: если true, то нет кнопок 'Добавить документ' и 'Удалить документ'
 * file_panels: массив объектов типа:
 *    name - title панели
 *    descr - описание того что нужно прикреплять
 *    req_id - уникальный номер панели
 *    withDescr - с полем для ввода описания или нет
 *    required - обязательно поле или нет
 */

Application.components.FilesPanel = Ext.extend(Ext.Panel, {
  initComponent: function() {
    var filetypes = [], component = this, defaults = {withDescr: true, required: false};
    for(var j=0, n=component.file_panels.length; j<n; ++j) {
      // making closure
      (function(i) {
        var current = component.file_panels[i];
        var file_item = component.uploadFilePanel(current, defaults, component);  // alena 2014.04.29
        var current_descr = (current.descr == null ? '' : current.descr);
        filetypes.push({
          title: current.name,
          xtype: component.is_panel ? 'panel' : 'fieldset',
          frame: component.is_panel ? true : false,
          cls: component.is_panel ? 'spaced-panel' : 'spaced-fieldset',
          bodyCssClass: component.is_panel ? 'subpanel-top-padding' : '',
          items: [{
            cls: 'spaced-panel',
            style: 'font-size: 9px',
            hidden: (undefined===current.descr || current.descr == null || current.descr.length==0),
            html: current_descr
          }, {
            xtype: 'panel',
            id: 'files_uploaded_'+(current.req_id||''),
            cls: 'spaced-bottom',
            border: false,
            hideTitle: true
          }, {
            xtype: 'panel',
            hideTitle: true,
            border: false,
            items: [file_item]// alena 2014.04.29 {
//              xtype: 'Application.components.UploadFilePanel',
//              fieldName: (current.req_id) ? 'docs['+current.req_id+'][]' : 'docs[]',
//              descrName: (current.req_id) ? 'docs_descr['+current.req_id+'][]' : 'docs_descr[]',
//              withDescr: (undefined !== current.withDescr) ? current.withDescr : defaults.withDescr,
//              required: (undefined !== current.required) ? current.required : defaults.required,
//              requiredMark: (current.requiredMark) ? true : false
//            }]
          }, {
            border: false,
            hideTitle: true,
            html: ACCEPTED_FILES
          }],
          buttons: [{
            text: 'Добавить документ',
            hidden: (component.onlyOne !== undefined ? component.onlyOne : false),
            handler: function() {
              var newField = component.uploadFilePanel(current, defaults, component);// alena 2014.04.29 {
//                xtype: 'Application.components.UploadFilePanel',
//                fieldName: (current.req_id) ? 'docs['+current.req_id+'][]' : 'docs[]',
//                descrName: (current.req_id) ? 'docs_descr['+current.req_id+'][]' : 'docs_descr[]',
//                withDescr: (current.withDescr != undefined) ? current.withDescr : defaults.withDescr,
//                required: (current.required != undefined) ? current.required : defaults.required,
//                requiredMark: (current.requiredMark) ? true : false
//              }
              var panel = this.findParentByType('panel');
              panel.insert(panel.items.length-1, newField);
              panel.doLayout();
            }
          }]
        });
      })(j);
    }
    Ext.apply(this, {
      frame: false,
      border: false,
      onlyOne: (this.onlyOne !== undefined ? this.onlyOne : false), // alena 2014.04.29
      items: filetypes
    });
    Application.components.FilesPanel.superclass.initComponent.call(this);
  },
  // alena 2014.04.29 -->--
  uploadFilePanel : function (current, defaults, component){
      return {
              xtype: 'Application.components.UploadFilePanel',
              fieldName: (current.req_id) ? 'docs['+current.req_id+'][]' : 'docs[]',
              descrName: (current.req_id) ? 'docs_descr['+current.req_id+'][]' : 'docs_descr[]',
              withDescr: (undefined !== current.withDescr) ? current.withDescr : defaults.withDescr,
              required: (undefined !== current.required) ? current.required : defaults.required,
              requiredMark: (current.requiredMark) ? true : false,
              allowCancel: (component.onlyOne !== undefined ? !component.onlyOne : true)
      };
  },  // --<-- alena 2014.04.29 
  isFileAttached: function() {
    var found = true;

    this.items.each(function(j){
      var f = false;
      for (var i=2; i<j.items.length-1; i++) {
        var item;
        if (2==i) {
          item = j.items.get(i).items.get(0);
        } else {
          item = j.items.get(i);
        }
        if (item && item.isFileAttached()) {
          f = true;
          break;
        }
      }

      if (!f) {
        found = false;
        return false;
      }
      return true;
    });
    return found;
  }
});