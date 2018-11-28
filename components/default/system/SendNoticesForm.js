
Application.components.SendNoticesForm = Ext.extend(Ext.form.FormPanel, {
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;

    function deleteField(field_set_id)
    {
      var fieldSet = Ext.getCmp(field_set_id);
      if (fieldSet !== undefined) {
        fieldSet.destroy();
      }
    }
        
    function showProcLotSelection(user_type, user_id) {
      deleteField('snf_proc_lot_selection');
      deleteField('snf_without_proc');
      var store_proc_lot;
      if (user_type == 1) {
        store_proc_lot = createProcLotStore({type: 'customer', id: user_id});
      } else {
        store_proc_lot = createProcLotStore({type: 'supplier', id: user_id});
      }
      var procLotSelection = {
        xtype: 'combo',
        fieldLabel: 'Процедура',
        id: 'snf_proc_lot_selection',
        hiddenName: 'lot',
        anchor: '100%',
        typeAhead: true,
        forceSelection: true,
        triggerAction: 'all',
        model: 'local',
        store: store_proc_lot,
        displayField: 'proc_lot_descr',
        valueField: 'id',
        allowBlank: false,
        width: 150,
        listeners: {
          select: function() {
            showCommonPart();
          },
          blur: function(obj) {
            if (obj.getValue() == '') {
              deleteField('snf_common_part_1');
              deleteField('snf_common_part_2');
            }
          }
        }
      };
      component.add(procLotSelection);
      
      var withoutProc = {
        xtype: 'checkbox',
        id: 'snf_without_proc',
        hideFieldLabel: false,
        boxLabel: 'Не привязывать к процедуре',
        listeners: {
          check: function(obj, checked) {
            var procSelection = Ext.getCmp('snf_proc_lot_selection');
            if (checked) {
              procSelection.disable();
              showCommonPart();
            } else {
              procSelection.enable();
              if (procSelection.getValue() == '') {
                deleteField('snf_common_part_1');
                deleteField('snf_common_part_2');
              }
            }
          }
        }
      };
      component.add(withoutProc);
      component.doLayout();
    }
        
    function showCompanySelection(user_type) {
      deleteField('snf_user_selection');
      var combo_title;
      var store_user;
      if (user_type == 1) {
        combo_title = 'Заказчик';
        store_user = createCompanyByType('customer');
      } else {
        combo_title = 'Заявитель';
        store_user = createCompanyByType('supplier');
      }
      var companySelection = {
        xtype: 'combo',
        id: 'snf_user_selection',
        hiddenName: 'customer_supplier',
        fieldLabel: combo_title,
        anchor: '100%',
        model: 'remote',
        store: store_user,
        displayField: 'full_name',
        valueField: 'id',
        minChars: 3,
        hideTrigger: true,
        forceSelection: true,
        typeAhead: true,
        triggerAction: 'all',
        allowBlank: false,
        width: 150,
        listeners: {
          select: function(combo, record) {
            deleteField('snf_common_part_1');
            deleteField('snf_common_part_2');
            showProcLotSelection(user_type, record.data['id']);
          }
        }
      };
      component.add(companySelection);
      component.doLayout();
    }
        
    function showCommonPart() {
      deleteField('snf_common_part_1');
      deleteField('snf_common_part_2');
      
      var commonPart1 = {
        xtype: 'textfield',
        fieldLabel: 'Тема сообщения',
        id: 'snf_common_part_1',
        name: 'subject',
        anchor: '100%',
        allowBlank: false
      };
      component.add(commonPart1);
      
      var commonPart2 = {
        xtype: 'textarea',
        fieldLabel: 'Текст сообщения',
        height: 200,
        id: 'snf_common_part_2',
        name: 'message_text',
        anchor: '100%',
        allowBlank: false
      };
      component.add(commonPart2);
      component.doLayout();
    }
    
    var basicChoice = {
      xtype: 'combo',
      fieldLabel: 'Получатель',
      id: 'snf_basic_choice',
      hiddenName: 'receiver_type',
      valueField: 'id',
      displayField: 'displayText',
      anchor: '100%',
      editable: false,
      mode: 'local',
      allowBlank: false,
      store: new Ext.data.ArrayStore({
            fields: [
                'id',
                'displayText'
            ],
            data: [
              [1,'Конкретному заказчику'],
              [2,'Конкретному заявителю'],
              [3,'Всем заказчикам'],
              [4,'Всем заявителям'],
              [5,'Всем пользователям']
            ]
        }),
      width: 150,
      triggerAction: 'all',
      listeners: {
        select: function(combo, record) {
          deleteField('snf_proc_lot_selection');
          deleteField('snf_without_proc');
          deleteField('snf_user_selection');
          deleteField('snf_common_part_1');
          deleteField('snf_common_part_2');
          if (record.json[0] == 1 || record.json[0] == 2) {
            showCompanySelection(record.json[0]);
          } else {
            showCommonPart();
          }
        }
      }
    };

    Ext.apply(this,
     {
      title: 'Рассылка уведомлений',
      labelWidth: 150,
      frame: true,
      autoScroll: true,
      fileUpload: true,
      items : [
        basicChoice
      ],
      buttons: [
      {
        text: 'Разослать',
        scope: this,
        formBind : true,
        handler: function(){
          if (this.getForm().isValid() !== true) {
            Ext.Msg.alert('Ошибка', 'Заполнены не все поля');
          } else {
            var parameters = this.getForm().getValues();
            
            var proc_lot = Ext.getCmp('snf_proc_lot_selection');
            if (typeof proc_lot !== 'undefined') {
              var proc_lot_store = proc_lot.getStore();
              var proc_lot_record = proc_lot_store.getById(proc_lot.getValue());
              if (typeof proc_lot_record !== 'undefined') {
                var proc_id = proc_lot_record.data.procedure_id;
                Ext.apply(parameters, {procedure_id: proc_id});
              }
            }
            
            performRPCCall(RPC.Admin.sendnotices, [parameters], {wait_text: 'Отправляем данные'}, function(result) {
              if (result.success) {
                Ext.Msg.alert('Успешно', 'Данные отправлены');
              } else {
                Ext.Msg.alert('Ошибка', result.message);
              }
            });
          }
        }
      }
      ]
    });
    Application.components.SendNoticesForm.superclass.initComponent.call(this);
    
    this.form.api = {
        submit: RPC.Admin.sendnotices
    };
    this.form.waitMsgTarget = true;
  }
});
