Ext.define('Application.components.templateGrid', {
  extend: 'Ext.Window',
  constrain: true,
  modal: true,
  autoSize: true,
  hideAction: 'close',
  mode: 'load',
  title: 'Шаблоны процедур',
  initComponent: function() {
    var grid_id = Ext.id(), save_id = Ext.id(), load_id = Ext.id();
    this.addEvents('templateloaded');
    var self = this;
    
    if (this.autoSize) {
      this.width = Ext.getBody().getWidth()*0.8;
      this.height = Ext.getBody().getHeight()*0.9;
    }
    
    if(Main.config.divide_innovation_templates){ 
      
      isInnovation = this.isInnovation;
      
      var store = new Ext.data.DirectStore({
        autoLoad: true,
        autoDestroy: true,
        api: {
          read: RPC.Procedure.listInnovationTemplates,
          create: RPC.Procedure.saveTemplate,
          update  : RPC.Procedure.updateTemplate,
          destroy : RPC.Procedure.deleteTemplate
        },
        sortInfo: {
          field: 'id',
          direction: 'ASC'
        },
        baseParams: {
          customer: Main.contragent.id,
          isInnovation: isInnovation,
          department:  Main.user.department_id
        },
        writer: new Ext.data.JsonWriter({encode: false, writeAllFields : true}),
        idProperty: 'id',
        paramsAsHash: true,
        root: 'templates',
        fields: ['id', 'title', 'department_name', 'organizer_department_id']
      });
      
    } else {
      
      var store = new Ext.data.DirectStore({
        autoLoad: true,
        autoDestroy: true,
        api: {
          read: RPC.Procedure.listTemplates,
          create: RPC.Procedure.saveTemplate,
          update  : RPC.Procedure.updateTemplate,
          destroy : RPC.Procedure.deleteTemplate
        },
        sortInfo: {
          field: 'id',
          direction: 'ASC'
        },
        baseParams: {
          customer: Main.contragent.id,
          department:  Main.user.department_id
        },
        writer: new Ext.data.JsonWriter({encode: false, writeAllFields : true}),
        idProperty: 'id',
        paramsAsHash: true,
        root: 'templates',
        fields: ['id', 'title', 'department_name', 'organizer_department_id']
      });
      
    }
    
    Ext.apply(this, {
      layout: 'fit',
      items: [{
        xtype: 'editorgrid',
        id: grid_id,
        store: store,
        viewConfig: {
          forceFit: true
        },
        columns: [
          {header: '#', dataIndex: 'id', hidden: true, sortable: true},
          {header: 'Наименование шаблона', dataIndex: 'title',
                    editor: Ext.ux.helpers.textEdit(), sortable: true},
          {header: 'Подразделение-инициатор', dataIndex: 'department_name', sortable: true},
          {header: 'Операции', xtype: 'textactioncolumn', width: 20, actionsSeparator: ' ',
            items: [{
              icon: '/ico/delete.png',
              tooltip: 'Удалить',
              handler: function(grid, rowIndex) {
                var store = grid.getStore();
                var record = store.getAt(rowIndex);
                if (!record.data.id) {
                  return;
                }
                Ext.Msg.confirm('Подтвердите',
                                    'Вы действительно хотите удалить шаблон «'+record.data.title+'»?',
                                    function(b)
                {
                  if ('yes'==b) {
                    store.removeAt(rowIndex);
                  }
                });
              },
              isHidden: function(v, meta, rec) {
                return !rec.data.id || (Main.config.template_show_dapartment && rec.data.organizer_department_id != Main.user.department_id);
              }
           }, {
             icon: '/images/icons/silk/disk.png',
             tooltip: 'Сохранить',
             isHidden: function(v, meta, rec) {
               return (Main.config.template_show_dapartment && rec.data.organizer_department_id && rec.data.organizer_department_id != Main.user.department_id)
                 || (Main.config.transfer_load_from_template_button ? false: (this.mode.indexOf('save') < 0));
             },
             handler: function() {Ext.getCmp(save_id).handler.call(this);},
             scope: this
           }, {
             icon: '/ico/arrow_down.png',
             tooltip: 'Загрузить',
             isHidden: function(v, meta, rec) {
                 return (Main.config.transfer_load_from_template_button && rec.data.id)
                   ? false
                   : self.mode.indexOf('load') < 0 || !rec.data.id;
             },
             handler: function() {
               Ext.getCmp(load_id).handler.call(this);
             },
             scope: this
           }]
        }],
        bbar: [
           {
             xtype: 'tbtext',
             hideBorders: true,
             cls: "normal-text",
             hideTitle: true,
             autoHeight: true,
             border: false,
             html: '<p>Вы можете переименовать шаблон, дважды кликнув по его имени в списке. '+
                 'Для загрузки или сохранения шаблона выберите его в списке и нажмите <br/>'+
                 'соответствующую кнопку.</p>'
          }
       ],
       listeners: {
         beforeedit: function(e) {
            if (!e.record.data.id) {
              return false;
            }
            return true;
          }
       }
      }],
      buttons: [],
      getSelectedTemplate: function() {
        var cmp = Ext.getCmp(grid_id);
        if (!cmp) {
          return false;
        }
        cmp = cmp.getSelectionModel().getSelectedCell();
        if (!cmp) {
          return false;
        }
        cmp = store.getAt(cmp[0]);
        return cmp;
      }
    });
    if (this.mode.indexOf('load')>=0) {
      this.buttons.unshift({
        text: 'Загрузить',
        id: load_id,
        handler: function() {
          var component = this;
          var id = this.getSelectedTemplate();
          if (!id || !id.data || !id.data.id) {
            Ext.Msg.alert('Ошибка', 'Вы не выбрали шаблон для загрузки');
            return;
          }
          id = id.data.id;
          if (id<=0) {
            Ext.Msg.alert('Ошибка', 'Не удалось загрузить этот шаблон');
            return;
          }
          var info = {id: id, procedure_id: this.procedure_id};
          RPC.Procedure.loadFileTemplate(info, function(result){
            if (result.success) {
              component.fireEvent('templateloaded', result.procedure);
            }
          });
        },
        scope: this
      });

    }
    if (this.mode.indexOf('save')>=0) {
      store.on('load', function() {
        var newtemplate = new store.recordType({id: 0, title: '[Новый шаблон]'});
        newtemplate.phantom = false;
        store.insert(0, newtemplate);
      });
      
      this.buttons.unshift({
        text: 'Сохранить',
        id: save_id,
        hidden:(Main.config.transfer_load_from_template_button)?true:false,
        handler: function() {
          var component = this;
          var title = 'Сохранение нового шаблона';
          var prompt = 'Введите имя для шаблона';
          var id = this.getSelectedTemplate();
          var tpl_title = '';
          if (id && id.data && id.data.id>0) {
            prompt = 'Вы действительно хотите перезаписать шаблон «'+id.data.title+'»?<br/>'+
                     'Введите новое имя шаблона';
            tpl_title = id.data.title;
            id = id.data.id;
          } else {
            id = 0;
          }
          Ext.Msg.prompt(title, prompt, function(b, txt){
            if ('ok'==b) {
              if (''==txt) {
                Ext.Msg.alert('Ошибка', 'Имя шаблона не должно быть пустым');
                return;
              }
              var params = {id: id, title: txt, contragent_id: Main.contragent.id};
              RPC.Procedure.saveTemplate(params, this.procedure_template, function(result){
                store.reload();
                echoResponseMessage(result);
                if (Main.config.template_show_dapartment && result.success) {
                  (function() {
                    Ext.MessageBox.hide();
                  }).defer(1500);
                  component.close();
                }
              });
            }
          }, this, false, tpl_title);
        },
        scope: this
      });
      
      if (Main.config.transfer_load_from_template_button) {
        this.buttons.unshift({
          text: 'Загрузить',
          id: load_id,
          hidden:true,
          handler: function() {
            var component = this;
            var id = this.getSelectedTemplate();
            if (!id || !id.data || !id.data.id) {
              Ext.Msg.alert('Ошибка', 'Вы не выбрали шаблон для загрузки');
              return;
            }
            id = id.data.id;
            if (id<=0) {
              Ext.Msg.alert('Ошибка', 'Не удалось загрузить этот шаблон');
              return;
            }
            RPC.Procedure.loadTemplate(id, function(result){
              if (result.success) {
                component.fireEvent('templateloaded', result.procedure);
              }
            });
          },
          scope: this
        });
      }
      
    }
    Application.components.templateGrid.superclass.initComponent.call(this);
  }
});
