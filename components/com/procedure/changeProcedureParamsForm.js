Ext.define('Application.components.changeProcedureParamsForm', {
    extend: 'Ext.form.Panel',
    autoHeight: true,
    border: false,
    bodyBorder: false,
    borderWidth: 0,
    initComponent: function () {
        var component = this;
        component.fieldWidth = 600;

        component.stepStore = createVocabProcedureStepsStore();
        component.stepStore.load();

        var items = component.createItems();
        var buttons = component.createButtons();

        items = items.concat(buttons);

        Ext.apply(this, {
            bodyCssClass: 'subpanel-top-padding',
            labelWidth: 300,
            items: items
        });

        Application.components.changeProcedureParamsForm.superclass.initComponent.call(this);
    },
    createTypeData: function () {
        var data = [
            ['GetLotIdByProcedureId', 'Получение идентификатора лота(ов) по идентификатору процедуры'],
            ['GetProcedureIdByLotId', 'Получение идентификатора процедуры по идентификатору лота'],
            ['ChangeStatusByProcedureId', 'Изменение статуса процедуры по id процедуры'],
            ['ChangeStatusByLotId', 'Изменение статуса процедуры по id лота'],
            ['RefreshProcedureDraft', 'Обновление драфта процедуры'],
            ['ChangeProcedureDates', 'Изменение даты процедуры'],
            ['RemoveArchiveDate', 'Извлечение процедуры из архива'],
            ['ChangeProcedureRegistryNumber', 'Изменение реестрового номера процедуры'],
            ['ChangeLotOkpdCode', 'Изменение кода ОКПД товаров лота']
        ];
        return data;
    },
    createEnabledFieldsArray: function () {
        var enabled_fields = {
            ChangeProcedureRegistryNumber: ['procedureId', 'registryNumber'],
            GetLotIdByProcedureId: ['procedureId'],
            ChangeStatusByProcedureId: ['procedureId', 'stepCombo'],
            ChangeStatusByLotId: ['stepCombo', 'lotId'],
            RefreshProcedureDraft: ['procedureId'],
            ChangeProcedureDates: ['procedureId', 'stepCombo', 'dateInterval', 'dateTypeCombo'],
            RemoveArchiveDate: ['procedureId'],
            ChangeLotOkpdCode: ['lotId', 'okpdCode'],
            GetProcedureIdByLotId: ['lotId']
        };
        return enabled_fields;
    },
    createMessageDataArray: function () {
        var message_data = {
            ChangeProcedureRegistryNumber: {
                error_message_start: '<br/>Процедуры с идентификатором ',
                id_type: 'procedure_id',
                success_message_start: '<br/>Реестровый номер изменен у процедуры ',
                with_name: false
            },
            GetLotIdByProcedureId: {
                error_message_start: '<br/>Процедуры с идентификатором ',
                id_type: 'procedure_id',
                success_message_start: '<br/>Идентификатор лота процедуры ',
                with_name: true
            },
            ChangeStatusByProcedureId: {
                error_message_start: '<br/>Процедуры с идентификатором ',
                id_type: 'procedure_id',
                success_message_start: '<br/>Статус процедуры ',
                with_name: true
            },
            ChangeStatusByLotId: {
                error_message_start: '<br/>Лота с идентификатором ',
                id_type: 'lot_id',
                success_message_start: '<br/>Статус лота ',
                with_name: true
            },
            RefreshProcedureDraft: {
                error_message_start: '<br/>Процедуры с идентификатором ',
                id_type: 'procedure_id',
                success_message_start: '<br/>Драфт обновлен для процедуры ',
                with_name: false
            },
            ChangeProcedureDates: {
                error_message_start: '<br/>Процедуры с идентификатором ',
                id_type: 'procedure_id',
                success_message_start: '<br/>Дата обновлена для процедуры ',
                with_name: false
            },
            RemoveArchiveDate: {
                error_message_start: '<br/>Процедуры с идентификатором ',
                id_type: 'procedure_id',
                success_message_start: '<br/>Дата архивации удалена у процедуры ',
                with_name: false
            },
            ChangeLotOkpdCode: {
                error_message_start: '<br/>Лота с идентификатором ',
                id_type: 'lot_id',
                success_message_start: '<br/>Код ОКПД изменен у товаров лота ',
                with_name: false
            },
            GetProcedureIdByLotId: {
                error_message_start: '<br/>Лота с идентификатором ',
                id_type: 'lot_id',
                success_message_start: '<br/>Идентификатор процедуры, которой принадлежит лот ',
                with_name: true
            }
        };
        return message_data;
    },
    createTypeStore: function () {
        var component = this;
        var store = new Ext.data.ArrayStore({
            fields: [
                {name: 'id', type: 'text'},
                {name: 'type', type: 'text'}
            ],
            idProperty: 'id',
            data: component.createTypeData(),
            autoDestroy: false
        });
        return store;
    },
    createDateTypeStore: function () {
        var store = new Ext.data.ArrayStore({
            fields: [
                {name: 'id', type: 'text'},
                {name: 'type', type: 'text'}
            ],
            idProperty: 'id',
            data: [
                ['date_start', 'Дата начала этапа'],
                ['date_end', 'Дата окончания этапа']
            ],
            autoDestroy: false
        });
        return store;
    },
    createLotDateStore: function () {
        var store = new Ext.data.ArrayStore({
            fields: [
                {name: 'id', type: 'text'},
                {name: 'type', type: 'text'}
            ],
            idProperty: 'id',
            data: [
                ['DateEndRegistration', 'Дата окончания подачи заявок'],
                ['DateEndFirstPartsReview', 'Дата окончания рассмотрения первых частей заявок'],
                ['DateBeginAuction', 'Дата начала торгов'],
                ['DateEndAuction', 'Дата окончания торгов'],
                ['DateEndSecondPartsReview', 'Дата окончания подведения итогов']
            ],
            autoDestroy: false
        });
        return store;
    },
    createTypeCombo: function () {
        var component = this;
        var combo = {
            xtype: 'combo',
            fieldLabel: 'Выберите тип изменения',
            editable: false,
            forceSelection: true,
            store: component.createTypeStore(),
            valueField: 'id',
            displayField: 'type',
            mode: 'local',
            triggerAction: 'all',
            name: 'change_type',
            ref: 'typeCombo',
            width: component.fieldWidth,
            listeners: {
                select: function (combo, record) {
                    component.switchVisibleFields(record.data.id);
                }
            }
        };
        return combo;
    },
    switchVisibleFields: function (type) {
        this.hideExtraFields();
        var enabled_fields = this.createEnabledFieldsArray()[type];
        for (var i = 0; i < enabled_fields.length; i++) {
            this.showAndEnable(this[enabled_fields[i]]);
        }
    },
    createProcedureIdField: function () {
        var component = this;
        var field = {
            xtype: 'textfield',
            fieldLabel: 'Введите идентификатор процедуры',
            name: 'procedure_id',
            hidden: true,
            disabled: true,
            width: component.fieldWidth,
            ref: 'procedureId'
        };
        return field;
    },
    createLotIdField: function () {
        var component = this;
        var field = {
            xtype: 'textfield',
            fieldLabel: 'Введите идентификатор лота',
            name: 'lot_id',
            hidden: true,
            disabled: true,
            width: component.fieldWidth,
            ref: 'lotId'
        };
        return field;
    },
    createStepCombo: function () {
        var component = this;
        var combo = {
            xtype: 'combo',
            fieldLabel: 'Выберите статус',
            editable: false,
            forceSelection: true,
            store: component.stepStore,
            valueField: 'pseudo',
            displayField: 'full_name',
            mode: 'local',
            triggerAction: 'all',
            name: 'step',
            hidden: true,
            disabled: true,
            width: component.fieldWidth,
            ref: 'stepCombo'
        };
        return combo;
    },
    createDateTypeField: function () {
        var component = this;
        var field = {
            xtype: 'combo',
            fieldLabel: 'Выберите дату для изменения',
            editable: false,
            forceSelection: true,
            store: component.createDateTypeStore(),
            valueField: 'id',
            displayField: 'type',
            mode: 'local',
            hidden: true,
            triggerAction: 'all',
            name: 'date_type',
            ref: 'dateTypeCombo',
            width: component.fieldWidth
        };
        return field;
    },
    createLotDateField: function () {
        var component = this;
        var field = {
            xtype: 'combo',
            fieldLabel: 'Выберите дату лота для изменения',
            editable: false,
            forceSelection: true,
            store: component.createLotDateStore(),
            valueField: 'id',
            displayField: 'type',
            mode: 'local',
            hidden: true,
            triggerAction: 'all',
            name: 'lot_date',
            ref: 'lotDateCombo',
            width: component.fieldWidth
        };
        return field;
    },
    createDateIntervalField: function () {
        var component = this;
        var field = {
            xtype: 'textfield',
            fieldLabel: 'Введите интервал, на который нужно изменить время',
            name: 'date_interval',
            hidden: true,
            disabled: true,
            width: component.fieldWidth,
            ref: 'dateInterval'
        };
        return field;
    },
    createLotPlanNumberField: function () {
        var component = this;
        var field = {
            xtype: 'textfield',
            fieldLabel: 'Введите новый реестровый номер позиции',
            name: 'lot_plan_number',
            hidden: true,
            disabled: true,
            width: component.fieldWidth,
            ref: 'lotPlanNumber'
        };
        return field;
    },
    createProcedureRegistryNumberField: function () {
        var component = this;
        var field = {
            xtype: 'textfield',
            fieldLabel: 'Введите новый реестровый номер процедуры',
            name: 'registry_number',
            hidden: true,
            disabled: true,
            width: component.fieldWidth,
            ref: 'registryNumber'
        };
        return field;
    },
    createLotOKPDField: function () {
        var component = this;
        var field = {
            xtype: 'textfield',
            fieldLabel: 'Введите код ОКПД',
            name: 'okpd_code',
            hidden: true,
            disabled: true,
            width: component.fieldWidth,
            ref: 'okpdCode'
        };
        return field;
    },
    createOrganizerINNField: function () {
        var component = this;
        var field = {
            xtype: 'textfield',
            fieldLabel: 'Введите ИНН организации',
            name: 'organizer_inn',
            hidden: true,
            disabled: true,
            width: component.fieldWidth,
            ref: 'organizerINN'
        };
        return field;
    },
    createOrganizerKPPField: function () {
        var component = this;
        var field = {
            xtype: 'textfield',
            fieldLabel: 'Введите КПП организации',
            name: 'organizer_kpp',
            hidden: true,
            disabled: true,
            width: component.fieldWidth,
            ref: 'organizerKPP'
        };
        return field;
    },
    createItems: function () {
        var component = this;
        var items = [
            component.createTypeCombo(),
            component.createProcedureIdField(),
            component.createLotIdField(),
            component.createStepCombo(),
            component.createDateTypeField(),
            component.createLotDateField(),
            component.createDateIntervalField(),
            component.createLotPlanNumberField(),
            component.createProcedureRegistryNumberField(),
            component.createLotOKPDField(),
            component.createOrganizerINNField(),
            component.createOrganizerKPPField()
        ];
        return items;
    },
    createButtons: function () {
        var component = this;
        var buttons = {
            xtype: 'fieldset',
            border: false,
            items: [
                component.createPerformButton()
            ]
        };
        return buttons;
    },
    createPerformButton: function () {
        var component = this;
        var button = {
            xtype: 'button',
            text: 'Выполнить',
            listeners: {
                click: function () {
                    component.performActions();
                }
            }
        };
        return button;
    },
    performActions: function () {
        var component = this;
        var data = {};
        component.items.each(function (p) {
            if (p.name !== undefined && !p.disabled) {
                var name = p.name;
                var value = p.getValue();
                data[name] = value;
            }
        });

        var params = {
            mask: true,
            mask_el: component.getEl(),
            scope: component
        };

        performRPCCall(RPC.Admin.changeProcedureParams, [data], params, function (resp) {
            if (resp && resp.success) {
                var message = component.generateResponseMessage(resp);
                Ext.MessageBox.alert("Успех!", message);
                component.clearFields();
            } else {
                echoResponseMessage(resp);
            }
        });
    },
    generateResponseMessage: function (resp) {
        var message = resp.message;
        var message_data = this.createMessageDataArray()[resp.type];
        Ext.each(resp.data, function (value) {
            if (value.success === false) {
                message += message_data.error_message_start + value[message_data.id_type] + ' не существует.';
            } else {
                message += message_data.success_message_start + value[message_data.id_type];
                if (message_data.with_name) {
                    message += ' имеет значение "' + value.full_name + '"';
                }
                message += '.';
            }
        });
        return message;
    },
    clearFields: function () {
        this.items.each(function (p) {
            if (p.name !== undefined && !p.disabled) {
                p.setValue(null);
            }
        });
        this.hideExtraFields();
    },
    hideExtraFields: function () {
        var component = this;
        component.items.each(function (p) {
            if (p.ref != undefined && p.ref != 'typeCombo') {
                component.hideAndDisable(component[p.ref]);
            }
        });
    },
    showAndEnable: function (field) {
        field.setVisible(true);
        field.setDisabled(false);
    },
    hideAndDisable: function (field) {
        field.setVisible(false);
        field.setDisabled(true);
    }
});
