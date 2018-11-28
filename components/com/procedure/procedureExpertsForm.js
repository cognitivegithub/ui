
Ext.define('Application.components.procedureExpertsForm', {
  extend: 'Ext.form.Panel',
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;

    var empty_text_id = Ext.id(),
        experts_list_id = Ext.id(),
        combo_expert_id = Ext.id();

    this.experts_added = {};

    this.addEvents('dataload');

    Ext.apply(this,
     {
      labelWidth: 150,
      frame: true,
      autoScroll: true,
      title: 'Формирование списка экспертов',
      fileUpload: true,
      items : [
        {
          xtype: 'Application.components.procedureViewPanel',
          procedure_id: component.procedure_id,
          procedureAutoLoad : true,
          autoHeight: true,
          frame: false,
          border: false,
          style: 'padding-bottom: 5px',
          listeners: {
            'dataload'  : function(procedure) {
              var combo_expert = Ext.getCmp(combo_expert_id);
              var combo_expert_store = combo_expert.getStore();
              combo_expert_store.load({callback: function() {
                if (procedure.experts && procedure.experts.length && procedure.experts.length > 0) {
                  for(var i=0; i<procedure.experts.length; i++) {
                    component.addExpert(procedure.experts[i], true);
                  }
                }
              }});
            }
          }
        }, {
          xtype: 'fieldset',
          title: 'Формирование списка экспертов',
          style: 'margin: 5px;',
          items : [
            {
              xtype: 'hidden',
              name: 'procedure_id',
              value: component.procedure_id
            }, {
              xtype: 'fieldset',
              border: false,
              style: 'padding-bottom: 0px;',
              items: [{
                xtype: 'combo',
                anchor: '100%',
                id: combo_expert_id,
                valueField: 'id',
                displayField: 'company',
                fieldLabel: 'Выбрать эксперта',
                mode: 'remote',
                minChars: 3,
                hideTrigger: true,
                forceSelection: true,
                typeAhead: true,
                store: createExpertsStore(USER_STATUS_AUTHORIZED),
                triggerAction: 'all'
              }],
              buttons: [{
                text: 'Добавить в список',
                handler: function() {
                  var combo_expert = Ext.getCmp(combo_expert_id);
                  var combo_expert_store = combo_expert.getStore();
                  component.addExpert(combo_expert.getValue());
                }
              }]
            }, {
              xtype: 'panel',
              title: 'Список экспертных организаций процедуры',
              border: true,
              frame: true,
              bodyStyle: 'padding: 10px;',
              id: experts_list_id,
              items: [{
                id: empty_text_id,
                html: 'Список пуст'
              }]
            }
          ],
          buttons: [{
            text: 'Удалить выбранных',
            handler: function() {
              var experts_list = component.getExpertsList();
              experts_list.items.each(function(item) {
                if (item.value && item.checked) {
                  experts_list.remove(item);
                  delete component.experts_added[item.value];
                }
              });
              component.emptyTextShow();
              component.doLayout();
            }
          }]
        }
      ],
      buttons: [{
        text: 'Сохранить',
        scope: this,
        formBind : true,
        handler: function() {
          var parameters = component.getValues();

          var experts = [];
          var experts_names = [];
          var confirm_text = '';
          for(var prop in component.experts_added) {
            experts.push(component.experts_added[prop].data.id);
            experts_names.push(component.experts_added[prop].data.company);
          }
          parameters.experts = experts;
          if (experts.length > 0) {
            experts_names = experts_names.join(', ');
            confirm_text = 'Вы собираетесь привлечь следующие экспертные организации: '+experts_names+'. Продолжить?';
          } else {
            confirm_text = 'Вы собираетесь оставить пустым перечень экспертных организаций. Продолжить?';
          }

          performRPCCall(RPC.Procedure.expertssave, [parameters], {confirm: confirm_text, wait_text: 'Сохраняем перечнь экспертов'}, function(result) {
            if(result.success) {
              Ext.Msg.alert('Успешно', 'Перечень экспертных организаций сохранен', function() {redirect_to('com/procedure/index');});
            } else {
              echoResponseMessage(result);
            }
          });
        }
      }, {
        text: 'Закрыть',
        handler: function() {
          redirect_to('com/procedure/index');
        }
      }],
      getValues : function() {
        var values = {};
        collectComponentValues(this, values, false);
        return values;
      },
      emptyTextShow: function() {
        var experts_list = component.getExpertsList();
        var empty_text = Ext.getCmp(empty_text_id);
        if (experts_list.items.length == 1) {
          empty_text.setVisible(true);
        } else {
          empty_text.setVisible(false);
        }
      },
      getExpertsList: function() {
        if (!this.experts_list) {
          this.experts_list = Ext.getCmp(experts_list_id);
        }
        return this.experts_list;
      },
      addExpert: function(id, untouchable) {
        if (component.experts_added[id]) {
          Ext.Msg.alert('Ошибка', 'Организация уже добавлена');
          return;
        }
        var combo_expert = Ext.getCmp(combo_expert_id);
        var combo_expert_store = combo_expert.getStore();
        var rec = combo_expert_store.getById(id);
        if (!rec) return;
        var experts_list = component.getExpertsList();
        experts_list.add({
          xtype: 'checkbox',
          hideFieldLabel: true,
          boxLabel: rec.data.company,
          value: id,
          readOnly: (true === untouchable ? true : false),
          disabled: (true === untouchable ? true : false)
        });
        component.experts_added[rec.data.id] = rec;
        combo_expert.clearValue();
        component.emptyTextShow();
        component.doLayout();
      }
    });
    Application.components.procedureExpertsForm.superclass.initComponent.call(this);
  }
});
