/**
 * Форма для присваивания значений
 */
Application.components.AssignForm = Ext.extend(Ext.form.FormPanel, {
  /**
   * Инициализация.
   * @return {void}
   */
  initComponent : function () {
    /**
     * Отправка формы.
     * @param Object form       Форма.
     * @param Function  success_fn Успех.
     * @returns {boolean} Возврат значения
     */
    function signForm(form, success_fn) {
      var formValues = form.getForm().getValues();
      var signatureValue = 'a';
      if (!checkSignatureResult(signatureValue)) {
        return false;
      }

      var onSuccess = function (resp) {
        resp.message = "Распределение прошло успешно";
        echoResponseMessage(resp);
        success_fn();
      };
      formValues.signature = signatureValue;
      var params = {
        mask: true,
        wait_text: 'Назначаем сотрудника'
      };

      performRPCCall(form.api, [formValues], params, function(result) {
        onSuccess(result);
      });
      return true;
    }

    var component = this;
    var cmp_width = 700;
    var users = component.users;
    var procedureValue = component.procedure_id == undefined ? component.procedureIdList : component.procedure_id;

    Ext.apply(this, {
      layout: 'form',
      bodyCssClass: 'subpanel-top-padding',
      bodyStyle: 'padding-right: 6px',
      width: cmp_width,
      frame: true,
      title: 'Выбор сотрудника ООЗ',
      labelWidth: 350,
      items: [
        {
          xtype: 'combo',
          fieldLabel: 'Выбор сотрудника ООЗ' + REQUIRED_FIELD,
          name: 'user_id',
          hiddenName: 'user_id',
          autoSelect: false,
          allowBlank: false,
          editable: false,
          triggerAction: 'all',
          typeAhead: true,
          isRequired: true,
          width:300,
          listWidth: 300,
          enableKeyEvents: true,
          mode: 'local',
          store: users,
          value: component.user_id
        },
        {
          xtype: 'textfield',
          fieldLabel: 'Разрядный номер извещения и закупочной документации',
          name: 'rank_number',
          width:300,
          allowBlank: true
        },
        {
          xtype: 'hidden',
          name: 'procedure_id',
          value: procedureValue
        }
      ],
      buttons: [{
        text: 'Закрыть',
        handler: function() {
          component.success_fn();
        },
        scope: this
      }, {
        text: 'Назначить',
        scope: this,
        formBind : true,
        handler: function() {
          if (component.getForm().isValid()) {
            signForm(this, component.success_fn);
          } else {
            Ext.Msg.alert('Ошибка', 'Необходимо заполнить поле!');
          }

        }
      }]
    });

    Application.components.PopupInfoForm.superclass.initComponent.call(this);
    this.form.api = {
      submit: component.api
    };
  }
});