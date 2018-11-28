Ext.ns('Main.stores');

function getCountriesStore() {
  return getStore('Countries', {
      storeId: 'Countries',
      directFn: RPC.Reference.list,
      paramsAsHash: true,
      autoLoad: false,
      idProperty: 'iso_nr',
      root: 'rows',
      totalProperty: 'totalCount',
      fields: [
        'iso_nr', 'name', 'alpha2', 'alpha3', 'eng_title'
      ],
      sortInfo: {
        field: 'rus_title',
        direction: 'ASC'
      },
      baseParams: {
        //limit: '10',
        extrafields: ['alpha2', 'alpha3', 'eng_title'],
        reftype: 'IsoCountries',
        idfield: 'iso_nr',
        namefield: 'rus_title'
      },
      remoteSort: true
    });
}

function getRegionStore() {
  return getStore('regions', {
      storeId: 'regions',
      directFn: RPC.Reference.list,
      paramsAsHash: true,
      autoLoad: false,
      idProperty: 'id',
      root: 'rows',
      totalProperty: 'totalCount',
      fields: [
        'id', 'name'
      ],
      sortInfo: {
        field: 'name_full',
        direction: 'ASC'
      },
      baseParams: {
        reftype: 'Regions',
        idfield: 'id',
        namefield: 'name_full'
      },
      remoteSort: true
    });
}

function createOkatoStore() {
    var store = new Ext.data.DirectStore({
      directFn: RPC.Reference.okato,
      paramsAsHash: true,
      root: 'rows',
      totalProperty: 'totalCount',
      fields: [
        'name'
      ],
      sortInfo: {
        field: 'code',
        direction: 'ASC'
      },
      baseParams: {
        limit: '10'
      },
      remoteSort: true
    });
  return store;
}

function createZonesStore(type, params) {
    var store = new Ext.data.DirectStore(
    {
      directFn: RPC.Reference.zones,
      paramsAsHash: true,
      root: 'rows',
      totalProperty: 'totalCount',
      fields: [
        'name', 'id'
      ],
      sortInfo: {
        field: 'name',
        direction: 'ASC'
      },
      baseParams: {
        reftype: type,
        params: params
      },
      remoteSort: true
    });
  return store;
}

function createRegionsStore(params) {
  var store = new Ext.data.DirectStore(
  {
    directFn: RPC.Reference.regionslist,
    paramsAsHash: true,
    root: 'rows',
    totalProperty: 'totalCount',
    fields: [
      'name'
    ],
    sortInfo: {
      field: 'name',
      direction: 'ASC'
    },
    baseParams: {
      params: params
    },
    remoteSort: true,
    autoLoad: true
  });
  store.addListener('load', function() {
    var rec = new Ext.data.Record.create([{name: 'Все'}]);
    this.insert(0, new rec({name: 'Все'}));
  });
  return store;
}

/**
 * Стор банков.
 * @returns {Object} Объект.
 */
function createBankAccountStore() {

  var store = new Ext.data.DirectStore(
    {
      directFn: RPC.Bankaccount.list,
      paramsAsHash: true,
      root: 'rows',
      idProperty: 'id',
      totalProperty: 'totalCount',
      fields: [
        'id', 'contragent_id', 'account', 'account_lic', 'bik', 'ogrn',
        'account_kor', 'bank', 'bank_addr', 'receiver', 'inn', 'kpp', 'actual'
      ],
      sortInfo: {
        field: 'id',
        direction: 'ASC'
      },
      remoteSort: true,
      autoLoad: true
    });
  return store;
}

function createLogStore(type, procedure_id) {
  var direct_fn = RPC.Log.index;
  if (type == 'procedure') {
    direct_fn = RPC.Log.procedurelog;
  }
  var store = new Ext.data.DirectStore(
  {
    directFn: direct_fn,
    paramsAsHash: true,
    autoSave: true,
    root: 'entries',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: [
      'id', 'pseudo', 'username', {name: 'timestamp', type: 'date', dateFormat: 'c'}, 'status', 'message', 'company', 'lot_number', 'event_eds', 'department', 'procedure_id', 'ip_address'    ],
    sortInfo: {
      field: 'timestamp',
      direction: 'DESC'
    },
    baseParams: {
      logtype : type,
      procedure_id : procedure_id
    },
    remoteSort: true
  });
  return store;
}

/**
 * Стор взаимодействия с ЕТП.
 *
 * @param {int} filter_key Ключ фильтрации.
 * @param {int} filter_value Значение фильтрации.
 * @param {int} etp_place Id площадки.
 *
 * @returns {Object} Объект.
 */
function createEtpStore(filter_key, filter_value, etp_place) {
  var store = new Ext.data.DirectStore(
    {
      directFn: RPC.Log.etplog,
      paramsAsHash: true,
      autoSave: true,
      root: 'entries',
      idProperty: 'id',
      totalProperty: 'totalCount',
      fields: [
        'id', {name: 'date_created', type: 'date', dateFormat: 'c'}, 'type', 'response_message', 'success',
        'message_body', 'response_body', 'decoded_response_body', 'decoded_message_body'
      ],
      sortInfo: {
        field: 'date_created',
        direction: 'DESC'
      },
      baseParams: {
        filter_key : filter_key,
        filter_value : filter_value,
        etp_place: etp_place
      },
      remoteSort: true
    });
  return store;
}

function createOosStore(filter_key, filter_value) {
  var direct_fn = RPC.Log.ooslog;

  var store = new Ext.data.DirectStore(
    {
      directFn: direct_fn,
      paramsAsHash: true,
      autoSave: true,
      root: 'entries',
      idProperty: 'id',
      totalProperty: 'totalCount',
      fields: [
        'id', 'event', {name: 'date_created', type: 'date', dateFormat: 'c'}, 'response', 'guid', 'details', 'direction_to','url_oos','url_xml','url_xml_confirm'
      ],
      sortInfo: {
        field: 'id',
        direction: 'ASC'
      },
      baseParams: {
        filter_key : filter_key,
        filter_value : filter_value
      },
      remoteSort: true
    });
  return store;
}

function createUserStore(directFn, sParams) {
  var store = new Ext.data.DirectStore({
    directFn: eval(directFn),
    paramsAsHash: true,
    autoSave: true,
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: [
      'id', 'username', 'user_email', 'user_job', 'status', 'first_name', 'middle_name', 'last_name',
      'certificate', 'secret_phraze', 'user_type', 'is_online', 'user_phone', 'department_count',
      {name: 'date_added', type: 'date', dateFormat: 'c'}, {name: 'date_last_update', type: 'date', dateFormat: 'c'}, 'company', 'contragent_id', 'status_name', 'department_name', 'rolesNames'
    ],
    sortInfo: {
      field: 'date_added',
      direction: 'ASC'
    },
    baseParams: merge_options(sParams, {limit: 50}),
    remoteSort: true
  });
  return store;
}

function createAdminUserStore(directFn, sParams) {
  var store = new Ext.data.DirectStore({
    directFn: eval(directFn),
    paramsAsHash: true,
    autoSave: true,
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: [
      'id', 'user_email', 'user_job', 'status', 'first_name', 'middle_name', 'last_name',
      {name: 'date_added', type: 'date', dateFormat: 'c'}, 'status_name', 'accred_id'
    ],
    sortInfo: {
      field: 'date_added',
      direction: 'ASC'
    },
    baseParams: merge_options(sParams, {limit: 50}),
    remoteSort: true
  });
  return store;
}

function createAccreditationStore(type) {
  var store = new Ext.data.DirectStore(
  {
    directFn: RPC.Accreditation.index,
    paramsAsHash: true,
    autoSave: true,
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: [
      'id', 'contragent_id', 'inn', 'kpp', 'date', 'full_name', 'email'
    ],
    sortInfo: {
      field: 'date',
      direction: 'ASC'
    },
    baseParams: {
      type : type,
      limit: '50'
    },
    remoteSort: true
  });
  return store;
}

/**
 * Create file types store.
 *
 * @returns {object} Return store.
 */
function createFileTypesStore() {
  return getStore('file_type_store',
    {
      paramsAsHash: true,
      autoSave: false,
      autoLoad: true,
      remoteSort: true,
      api: {
        read: RPC.Reference.documentTypeList,
        create: RPC.Reference.documentTypeUpsert,
        update: RPC.Reference.documentTypeUpsert,
        destroy: RPC.Reference.documentTypeRemove
      },
      writer: new Ext.data.JsonWriter({
        encode: false,
        writeAllFields: true
      }),
      root: 'rows',
      idProperty: 'id',
      totalProperty: 'totalCount',
      fields: [
        'id',
        'name',
        'use_count'
      ],
      sortInfo: {
        field: 'id',
        direction: 'ASC'
      }
    });
}

function createAccreditationDeclinedStore(type) {
  return getStore('accreditation_declined',
  {
    storeId: 'accreditation_declined',
    directFn: RPC.Accreditation.declined,
    paramsAsHash: true,
    autoDestroy: true,
    idProperty: 'id',
    root: 'rows',
    totalProperty: 'totalCount',
    fields: [
      'id', 'contragent_id', 'inn', 'full_name', 'reason_declined', 'operator_name'
    ],
    baseParams: {
      type: type
    }
  });
}

function createUserAccreditationStore() {
  var store = new Ext.data.DirectStore(
  {
    directFn: RPC.Accreditation.users,
    paramsAsHash: true,
    autoSave: true,
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: [
      'id', 'first_name', 'middle_name', 'last_name', 'user_email', 'role', 'status', 'date', 'user_job'
    ],
    sortInfo: {
      field: 'date',
      direction: 'ASC'
    },
    baseParams: {
      limit: '50'
    },
    remoteSort: true
  });
  return store;
}

function getProfileStore(basic_group_value) {

  var store = new Ext.data.DirectStore(
  {
    storeId: 'profile_types_'+basic_group_value,
    directFn: RPC.Company.loadprofiles,
    paramsAsHash: true,
    baseParams: {
      cmp_group: basic_group_value
    },
    idProperty: 'id',
    root: 'profiles',
    totalProperty: 'totalCount',
    fields: [
      'id', 'name'
    ]
  });
  return store;
}

/**
 * Стор контрагентов.
 * @returns {Object} Объект.
 */
function getContragentStore() {
  var cmpStore = new Ext.data.DirectStore(
  {
    storeId: 'contragent_list',
    directFn: RPC.Company.search,
    paramsAsHash: true,
    autoLoad: true,
    idProperty: 'rowid',
    baseParams: {
      add_blank: 0
    },
    fields: [
      'rowid', 'inn', 'kpp', 'ogrn', 'full_name', 'display_field', 'small_biz', 'address_legal', 'address_postal', 
        'phone']
  });

  return cmpStore;
}

function getContragentStoreByInn(inn) {
  var cmpStore = new Ext.data.DirectStore(
  {
    storeId: 'profile_types',
    directFn: RPC.Company.search,
    paramsAsHash: true,
    autoLoad: false,
    params: {
      inn: inn
    },
    fields: [
      'rowid', 'inn', 'kpp', 'ogrn', 'full_name', 'display_field', 'small_biz', 'address_legal', 'address_postal'
    ]
  });
  return cmpStore;
}

function getContragentStoreByName() {
    var store = new Ext.data.DirectStore({
      directFn: RPC.Company.searchByNameForRepresentatives,
      paramsAsHash: true,
      totalProperty: 'totalCount',
      fields: [
        'rowid', 'full_name'
      ],
      baseParams: {
        limit: '10'
      },
      remoteSort: true
    });
  return store;
}

function getApiResourcesStore() {
  return getStore('api_resources', {
      autoLoad: true,
      api: {
        read    : RPC.Acl.apiResourcesIndex,
        create  : RPC.Acl.apiResourcesUpdate,
        update  : RPC.Acl.apiResourcesUpdate,
        destroy : RPC.Acl.apiResourcesDelete
      },
      sortInfo: {
        field: 'url',
        direction: 'ASC'
      },
      writer: new Ext.data.JsonWriter({encode: false, writeAllFields : true}),
      idProperty: 'id',
      autoSave: false,
      paramsAsHash: true,
      root: 'resources',
      fields: ['id', 'module','controller', 'action', 'descr', {name: 'log', type: 'bool'},
               {name: 'url', convert: function(v, record){
                 return record.module+'/'+record.controller + '/' + record.action;
               }}]
    });
}

function getGuiResourcesStore() {
  return getStore('gui_resources', {
      autoLoad: true,
      api: {
        read    : RPC.Acl.guiResourcesIndex,
        create  : RPC.Acl.guiResourcesUpdate,
        update  : RPC.Acl.guiResourcesUpdate,
        destroy : RPC.Acl.guiResourcesDelete
      },
      sortInfo: {
        field: 'url',
        direction: 'ASC'
      },
      writer: new Ext.data.JsonWriter({encode: false, writeAllFields : true}),
      idProperty: 'id',
      autoSave: false,
      paramsAsHash: true,
      root: 'resources',
      fields: ['id', 'url', 'descr', 'icon', 'menupath', {name:'weight', type: 'int'}]
    });
}

function getMenuResourcesStore() {
  return getStore('menu_resources', {
      autoLoad: true,
      api: {
        read    : RPC.Acl.menuResourcesIndex,
        create  : RPC.Acl.menuResourcesUpdate,
        update  : RPC.Acl.menuResourcesUpdate,
        destroy : RPC.Acl.menuResourcesDelete
      },
      sortInfo: {
        field: 'menupath',
        direction: 'ASC'
      },
      writer: new Ext.data.JsonWriter({encode: false, writeAllFields : true}),
      idProperty: 'id',
      autoSave: false,
      paramsAsHash: true,
      root: 'resources',
      fields: ['id', 'url', 'icon', 'menupath', {name:'weight', type: 'int'}]
    });
}

function getRolesStore() {
  return getStore('roles', {
    autoLoad: true,
    api: {
      read    : RPC.Acl.roleIndex,
      create  : RPC.Acl.roleUpdate,
      update  : RPC.Acl.roleUpdate,
      destroy : RPC.Acl.roleDelete
    },
    writer: new Ext.data.JsonWriter({encode: false, writeAllFields : true}),
    idProperty: 'id',
    autoSave: false,
    paramsAsHash: true,
    root: 'roles',
    fields: ['id', 'name', 'code', 'actual', 'user_role', 'operator_role', 'customer_role', 'supplier_role']
  });
}

function getCurrencyStore() {
  return getStore('currency', {
      autoLoad: true,
      directFn: RPC.Reference.currency,
      sortInfo: {
        field: 'description',
        direction: 'ASC'
      },
      idProperty: 'id',
      root: 'currency',
      fields: ['id', 'name', 'description', 'country_id', 'alpha2', 'alpha3']
    });
}

function getCurrencyRatesStore() {
  return getStore('currency_rates', {
      autoLoad: true,
      directFn: RPC_po.Reference.currencyRates,
      sortInfo: {
        field: 'id',
        direction: 'DESC'
      },
      idProperty: 'id',
      root: 'currency_rates',
      fields: ['id', 'name', 'rate', 'nominal', 'rate_date', 'currency_id', 'description']
    });
}

function getLotStore(procedure_id) {
  var lot_store = new Ext.data.DirectStore({
      autoLoad: true,
      directFn: RPC.Lot.list,
      sortInfo: {
        field: 'id',
        direction: 'ASC'
      },
      baseParams: {
        procedure: procedure_id
      },
      idProperty: 'id',
      paramsAsHash: true,
      root: 'lots',
      fields: ['id', 'subject', 'guarantee_application','lot_customers', 'start_price']
    });
  return lot_store;
}

function getTimezonesStore() {
  return getStore('timezones', {
    directFn: RPC.Index.timezones,
    paramsAsHash: true,
    autoLoad: true,
    root: 'rows',
    idProperty: 'phptz',
    fields: [
      'phptz', 'name'
    ]
  });
}

function createRepresentationRightsStore(requests) {
  var rights_store = new Ext.data.DirectStore({
    autoLoad: true,
    directFn: RPC.Company.representationRightsList,
    root: 'rows',
    sortInfo: {
      field: 'id',
      direction: 'ASC'
    },
    baseParams: {
      requests: requests
    },
    idProperty: 'id',
    paramsAsHash: true,
    fields: ['id', 'date', 'valid_for', 'full_name', 'status', 'representative_id', 'contragent_id']
  });
  return rights_store;
}

function createRepresentedRightsStore(requests) {
  var rights_store = new Ext.data.DirectStore({
    autoLoad: true,
    directFn: RPC.Company.representedRightsList,
    root: 'rows',
    sortInfo: {
      field: 'id',
      direction: 'ASC'
    },
    baseParams: {
      requests: requests
    },
    idProperty: 'id',
    paramsAsHash: true,
    fields: ['id', 'date', 'valid_for', 'full_name', 'status', 'representative_id', 'contragent_id']
  });
  return rights_store;
}

function createApplicStore(directFn, sParams, advFields) {
  var fields = [
    'id', 'status', 'lot_id', 'procedure_id', 'procedure_title', 'lot_status',
    'lot_number', 'order_number_assigned', 'status_text', 'frm',
    {name: 'date_added', type: 'date', dateFormat: 'c'},
    {name: 'time_added', type: 'date', dateFormat: 'c'}];
  for (var el in advFields) {
    if (advFields.hasOwnProperty(el)) {
      fields.push(advFields[el]);
    }
  }
  var store = new Ext.data.DirectStore({
    directFn: directFn,
    paramsAsHash: true,
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    autoSave: true,
    fields: fields,
    sortInfo: {
      field: 'date_added',
      direction: 'DESC'
    },
    baseParams: sParams,
    remoteSort: true
  });
  return store;
}

function createMailLogStore(sParams) {
  var store = new Ext.data.DirectStore({
    directFn: RPC.Log.maillist,
    paramsAsHash: true,
    root: 'entries',
    idProperty: 'id',
    totalProperty: 'totalCount',
    autoSave: true,
    fields: ['id', {name: 'datetime_sent', type: 'date', dateFormat: 'c'}, 'subject', 'contragent_fullname', 'user_fullname', 'contragent_id', 'user_id', 'title', 'procedure_id'],
    sortInfo: {
      field: 'datetime_sent',
      direction: 'DESC'
    },
    baseParams: sParams,
    remoteSort: true
  });
  return store;
}

function createCompanyByType(company_type) {
  var store = new Ext.data.DirectStore({
    directFn: RPC.Admin.getcompanies,
    paramsAsHash: true,
    root: 'entries',
    idProperty: 'id',
    fields: ['id', 'full_name', 'inn'],
    sortInfo: {
      field: 'full_name',
      direction: 'ASC'
    },
    baseParams: {
      type: company_type
    },
    remoteSort: true
  });
  return store;
}

function createProcLotStore(params) {
  var store = new Ext.data.DirectStore({
    directFn: RPC.Admin.getproclot,
    paramsAsHash: true,
    root: 'entries',
    idProperty: 'id',
    fields: ['id', 'procedure_id', 'proc_lot_descr'],
    sortInfo: {
      field: 'proc_lot_descr',
      direction: 'ASC'
    },
    baseParams: params
  });
  return store;
}

/**
 * Стор делает.
 *
 * @param {string} type Тип.
 * @param {Object} baseParamsExt Параметры.
 *
 * @returns {Object} Объект.
 */
function createCompanyStore(type, baseParamsExt) {
  var baseParams = {
    type : type,
    limit: '50'
  };
  if (baseParamsExt) {
    Ext.apply(baseParams, baseParamsExt);
  }
  var store = new Ext.data.DirectStore(
    {
      directFn: RPC.Company.list,
      paramsAsHash: true,
      autoSave: true,
      root: 'entries',
      idProperty: 'id',
      totalProperty: 'totalCount',
      stateful: false,
      fields: [
        'id', 'guid', 'full_name', 'customer_profile_name', 'supplier_profile_name', 'status', 'inn', 'kpp', 'rnp',
        {name: 'date_added'}, 'block_reason', 'account', 'small_biz'
      ],
      sortInfo: {
        field: 'id',
        direction: 'ASC'
      },
      baseParams: baseParams,
      remoteSort: true
    });
  return store;
}

/**
 * Фильтрует.
 *
 * @param {Array} array Массив
 * @param {string} property Свойстово.
 * @param {Array} options Параметры.
 *
 * @returns {Array} Объект.
 */
function treatmentByOptions (array, property, options) {
  var newColumns = [];
  for (var i = array.length; i--;) {
    var column = array[i];
    var drawIndex = options.indexOf(column[property]);
    if (column[property] && drawIndex !== NO_MAGIC_NUMBER_MINUS_ONE) {
      newColumns[drawIndex] = column;
    }
  }
  return newColumns;
}

function createProfilesStore(cmp_group) {
  var store = new Ext.data.DirectStore({
    directFn: RPC.Company.loadprofiles,
    paramsAsHash: true,
    reader: new Ext.data.ArrayReader({
                    idIndex: 0,
                    fields: [
                      {
                        "mapping": "id",
                        "name": "id",
                        "id": "id"
                      },{
                        "mapping": "name",
                        "name": "name",
                        "id": "name"
                      }
                    ],
                    root: 'profiles'
                }),
    baseParams: {
      cmp_group: cmp_group
    }
  });
  return store;
}

function createEvadedSuppliersStore(type) {
  var store = new Ext.data.DirectStore(
  {
    directFn: RPC.Company.evadedList,
    paramsAsHash: true,
    autoSave: true,
    root: 'suppliers',
    idProperty: 'lot_id' + 'id',
    totalProperty: 'totalCount',
    fields: [
      'id' , 'lot_id', 'procedure_id', 'inn', 'full_name', 'customer', 'registry_number', 'guarantee', 'customer_fee', 'subject', 'show_links', 'blocks_count', 'supplier_id'
    ],
    sortInfo: {
      field: 'full_name',
      direction: 'ASC'
    },
    baseParams: {
      type : type,
      limit: '50'
    },
    remoteSort: true
  });
  return store;
}


/**
 * Store для комбо выбора извещения (процедура/лот).
 *
 */
function createContragentApplicationsListStore(supplierId) {
  var store = new Ext.data.DirectStore({
    directFn      : RPC.Finance.operations,
    paramsAsHash  : true,

    reader        : new Ext.data.JsonReader({
      idProperty  : 'id',
      messageProperty : 'message',
      fields      : [
        {name: 'id', mapping: 'id'},
        {name: 'supplier', mapping: 'supplier_id'},
        {name: 'text', convert: function(v, record) {
          return record.registry_number + ', лот №' + record.lot_number;
        }},
        {name: 'regNum', mapping: 'registry_number'},
        {name: 'lotNum', mapping: 'lot_number'},
        {name: 'procedureId', mapping: 'procedure_id'},
        {name: 'lotId', mapping: 'lot_id'}
      ],
      root        : 'applications'
    }),

    autoLoad      : true,
    remoteSort    : false,

    baseParams    : {
      supplier      : supplierId,
      request       : 'LIST'
    }
  });
  return store;
}


function createBannedContragentsStore() {
  var store = new Ext.data.DirectStore(
  {
    directFn: RPC.Company.banList,
    paramsAsHash: true,
    autoSave: true,
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: [
      'id', 'full_name', 'inn', 'kpp'
    ],
    sortInfo: {
      field: 'full_name',
      direction: 'ASC'
    },
    baseParams: {
      limit: '50'
    },
    remoteSort: true
  });
  return store;
}

function createExpireContragentsStore() {
  var store = new Ext.data.DirectStore(
  {
    directFn: RPC.Company.expireList,
    paramsAsHash: true,
    autoSave: true,
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: [
      'id', 'full_name', 'inn', 'kpp', {name: 'valid_for', type: 'date', dateformat: 'c'}
    ],
    sortInfo: {
      field: 'full_name',
      direction: 'ASC'
    },
    baseParams: {
      limit: '50'
    },
    remoteSort: true
  });
  return store;
}

/**
 * Store для выпадайки выбора процедуры.
 *
 */
function createProcedureShortListStore(params) {
  var store = new Ext.data.DirectStore({
    directFn      : RPC.Procedure.getShortList,
    paramsAsHash  : true,

    reader        : new Ext.data.JsonReader({
      idProperty  : 'id',
      fields      : [
        {name: 'id', mapping: 'id'},
        {name: 'regNum', mapping: 'registry_number'},
        {name: 'title', mapping: 'title'},
        {name: 'lots', mapping: 'lots_id'},
        {name: 'summary', convert: function(v, record) {
          return record.registry_number + ' (' + record.title + ')';
        }}
      ],
      root        : 'procedures'
    }),

    sortInfo      : {
      field         : 'registry_number',
      direction     : 'ASC'
    },
    remoteSort    : true,
    baseParams    : Ext.apply({
      limit         : 20
    }, params||{})
  });
  return store;
}


function createFiscalDocsGridStore(params) {
  var store = new Ext.data.DirectStore({
    directFn      : RPC.Admin.searchdocs,
    paramsAsHash  : true,

    remoteSort    : true,
    autoLoad      : true,

    reader        : new Ext.data.JsonReader({
      root          : 'docs',
      idProperty    : 'id',
      totalProperty : 'totalCount',

      fields        : [
        'id',               // acts
        'full_name',        // acts
        'price',            // acts
        'registry_number',  // procedures
        'customer',         // contragents
        'number',           // acts
        {name :'date_forwarded', type: 'date', dateFormat: 'Y-m-d'},
        {name :'date_signed', type: 'date', dateFormat: 'Y-m-d'},
        'inn',              // contragents
        'kpp',              // contragents
        'prefer_stamped_docs', // contragents
        'supplier_id',      // contragents
        'account',          // contragents
        'customer_id',      // contragents
        'number',           // acts
        {
          name        : 'date_generated', // acts
          type        : 'date',
          dateFormat  : 'Y-m-d'
        }
      ] // fields definition
    }), // store reader
    sortInfo      : {
      field         : 'number',
      direction     : 'DESC'
    },
    listeners     : {
      load          : function(store, records, opts) {
        // console.debug(records);

      }
    }
  });

  //store.setDefaultSort('id', 'desc');

  return store;
}

function getGuaranteeAdvanceTypesStore() {
  return getStore('guarantee_advance_types', {
    fields: ['id', 'name'],
    data: [[1,'До заключения договора'], [2,'С момента заключения договора']]
  }, 'ArrayStore');
}

function getMonthNamesStore() {
  return getStore('month_names', {
    id: 0,
    fields: [
      {name: 'id', type: 'integer'},
      {name: 'name', type: 'string'}
            ],
    data: [
      [1, 'Январь'],
      [2, 'Февраль'],
      [3, 'Март'],
      [4, 'Апрель'],
      [5, 'Май'],
      [6, 'Июнь'],
      [7, 'Июль'],
      [8, 'Август'],
      [9, 'Сентябрь'],
      [10, 'Октябрь'],
      [11, 'Ноябрь'],
      [12, 'Декабрь']]
  }, 'ArrayStore');
}

function getStore(store_id, store_config, store_type) {
  var store = Ext.StoreMgr.get(store_id);
  if (!store) {
    if (!store_type) {
      store_type = 'DirectStore';
    }
    //2014/03/17 ptanya 4039 Заведем свойство loaded, чтобы по несколько раз не грузить словари
    store_config['listeners'] = store_config['listeners'] || {};
    if (!store_config['listeners']['load']) {
      store_config['listeners'] = {'load' : function(store,records,options) {
              store.loaded = true;
        }} || store_config['listeners'];
    }
    store = new Ext.data[store_type](store_config);

    Ext.StoreMgr.add(store_id, store);
  }
  return store;
}

/**
 * History лота.
 * @param {Integer} lot_id Lot id.
 * @return {Object} store
 */
function getLotHistoryStore(lot_id) {
  var store = new Ext.data.DirectStore({
    directFn      : RPC.Lot.history,
    paramsAsHash  : true,
    groupField    :'lot_id',
    remoteSort    : true,
    autoLoad      : true,
    baseParams: {
      lot: lot_id
    },
    reader        : new Ext.data.JsonReader({
      root          : 'entries',
      totalProperty : 'totalCount',

      fields        : [
        'field',
        'from',
        'lot_id',
        'to',
        'user',
        {
          name        : 'date',
          type        : 'date',
          dateFormat  : 'c'
        }
      ]
    })
  });

  return store;
}

function getProcedureHistoryStore(procedure_id) {
  var store = new Ext.data.DirectStore({
    directFn      : RPC.Procedure.history,
    paramsAsHash  : true,
    groupField    :'lot_id',
    remoteSort    : true,
    autoLoad      : true,
    baseParams: {
      procedure: procedure_id
    },
    reader        : new Ext.data.JsonReader({
      root          : 'entries',
      totalProperty : 'totalCount',

      fields        : [
        'field',       // acts
        'from',            // acts
        'lot_id',
        'to',  // procedures
        'user', //2014/03/06 ptanya 4291 Информация о пользователе
        {
          name        : 'date', // acts
          type        : 'date',
          dateFormat  : 'c'
        }
      ] // fields definition
    })
  });

  return store;
}

function createInvitesLogStore() {
  var store = new Ext.data.DirectStore(
  {
    directFn: RPC.Log.inviteslog,
    paramsAsHash: true,
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: [
      'id', 'subject', {name: 'date_sent', type: 'date', dateFormat: 'c'}, 'username'
    ],
    sortInfo: {
      field: 'date_sent',
      direction: 'DESC'
    },
    remoteSort: true
  });
  return store;
}

function createUserRolesStore() {
  var store = new Ext.data.DirectStore({
    directFn: RPC.User.loaduserroles,
    paramsAsHash: true,
    reader: new Ext.data.ArrayReader({
                    idIndex: 0,
                    fields: ['id', 'name'],
                    root: 'userroles'
                })
  });
  return store;
}

function createFiscalDoscStore(sParams) {
  var store = new Ext.data.DirectStore({
    directFn: RPC.Finance.fiscaldocslist,
    paramsAsHash: true,
    root: 'docs',
    idProperty: 'id',
    totalProperty: 'totalCount',
    autoSave: true,
    fields: ['id', 'registry_number', 'price', 'customer', 'number', 'date_forwarded', 'date_signed',
        'date_signed', 'date_forwarded',
        {name: 'date_generated', type: 'date', dateFormat  : 'Y-m-d'}],
    sortInfo: {
      field: 'id',
      direction: 'DESC'
    },
    baseParams: sParams,
    remoteSort: true
  });
  return store;
}

function createEtpPeersStore() {
  var store = new Ext.data.DirectStore({
    directFn: RPC.Admin.etppeerslist,
    paramsAsHash: true,
    root: 'entries',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: ['id', 'name', 'code', 'endpoint', 'type'],
    sortInfo: {
      field: 'id',
      direction: 'ASC'
    },
    remoteSort: true
  });
  return store;
}


function getOkeiSimpleStore() {
  return getStore('okeiSimpleStore', {
        id: 0,
        storeId: 'okeiSimpleStore',
        fields: [
            'id',
            'name'
        ],
        data: [
          [6, 'М'],
          [3, 'ММ'],
          [4, 'СМ'],
          [5,'ДМ'],
          [8, 'КМ (ТЫС М)'],
          [18,'ПОГ М'],
          [19,'ТЫС ПОГ М'],
          [20,'УСЛ М'],
          [39,'ДЮЙМ'],
          [55,'М2'],
          [59,'ГА'],
          [61,'КМ2'],
          [113,'М3'],
          [114,'ТЫС М3'],
          [112,'Л'],
          [116,'ДКЛ'],
          [163,'Г'],
          [166,'КГ'],
          [168,'Т'],
          [169,'ТЫС Т'],
          [171,'МЛН Т'],
          [673,'ТЫС КОМПЛ'],
          [616,'БОБ'],
          [625,'ЛИСТ'],
          [642,'ЕД'],
          [736,'РУЛ'],
          [778,'УПАК'],
          [796,'ШТ'],
          [798,'ТЫС ШТ'],
          [839,'КОМПЛ'],
          [868,'БУТ'],
          [876,'УСЛ ЕД']
      ]
    }, 'ArrayStore');
}

/**
 * Возвращает store для типов документов исполнение договора.
 *
 * @returns {object} Store.
 */
function getContractDocumentTypesStore() {
  return getStore('contractDocumentTypes',
  {
    autoLoad: true,
    autoSave: false,
    remoteSort: false,
    sortInfo: {
      field: 'id',
      direction: 'ASC'
    },
    api: {
      read: RPC.Reference.getContractDocumentTypes
    },
    idProperty: 'id',
    root: 'list',
    totalProperty: 'totalCount',
    fields: [
      'id',
      'name'
    ]
  });
}

function getOkeiStore() {
  return getStore('okeiStore',
  {
    //storeId: 'okeiStore',
    directFn: RPC.Reference.list,
    paramsAsHash: true,
    idProperty: 'id',
    root: 'rows',
    totalProperty: 'totalCount',
    fields: [
      'id', {name: 'code', type: 'string'}, 'name'
    ],
    sortInfo: {
      field: 'symbol',
      direction: 'ASC'
    },
    baseParams: {
      table: 'list',
      reftype: 'Okei',
      idfield: 'code',
      namefield: 'symbol',
      notempty: true
    },
    remoteSort: true
  });
}

/**
 * Возвращает стор со справочником "Способы закупки по классификатору ЕИС".
 *
 * @param {boolean} is_electronic Только закупки в электронном виде.
 * @param {integer} contragent_id Идентификатор контрагента.
 * @param {boolean} limitByVocabProcedureTypes Ограничить выбор типами из справочника типов.
 *
 * @return {Ext.data.DirectStore} Стор.
 */
function getPurchaseMethodStore(is_electronic, contragent_id, limitByVocabProcedureTypes) {
  var key = ['purchaseMethodStore'];
  key.push(contragent_id || 'active');
  if (is_electronic) {
    key.push('electronic');
  }
  return getStore(key.join('_'),
  {
    storeId: 'purchaseMethodStore',
    directFn: RPC.Reference.purchasemethod,
    autoLoad: false,
    paramsAsHash: true,
    autoDestroy: false,
    idProperty: 'id',
    baseParams: {
      is_electronic : is_electronic,
      contragent_id: contragent_id || null,
      limitByVocabProcedureTypes: limitByVocabProcedureTypes || null
    },
    root: 'rows',
    totalProperty: 'totalCount',
    fields: [
      'id', 'code', 'name', 'order_clause_id'
    ],
    sortInfo: {
      field: 'order_clause_id',
      direction: 'ASC'
    },
    remoteSort: true
  });
}

function getWeekStore(numWeeks) {
  if(!numWeeks) numWeeks=10;

  var weekData = [[0, 'Не указано']], i=0;

  for (i=1; i<=numWeeks; i++) {
    weekData.push([i, i+' нед.']);
  }
  return getStore('weekStore'+numWeeks, {
        id: 0,
        storeId: 'weekStore'+numWeeks,
        fields: [
            'id',
            'name'
        ],
        data: weekData
    }, 'ArrayStore');
}

function getConditionStore() {
  return getStore('conditionStore',
  {
    storeId: 'conditionStore',
    directFn: RPC.Reference.list,
    paramsAsHash: true,
    autoDestroy: true,
    idProperty: 'id',
    root: 'rows',
    totalProperty: 'totalCount',
    fields: [
      'id', 'name'
    ],
    sortInfo: {
      field: 'name',
      direction: 'ASC'
    },
    baseParams: {
      limit: '10',
      reftype: 'Condition',
      idfield: 'id',
      namefield: 'name'
    },
    remoteSort: true
  });
}

function getNomenclatureStore() {
  return getStore('okpStore',
  {
    storeId: 'okpStore',
    directFn: RPC.Reference.nomenclature,
    paramsAsHash: true,
    autoDestroy: true,
    idProperty: 'id',
    root: 'rows',
    totalProperty: 'totalCount',
    fields: [
      'id', 'text'
    ],
    baseParams: {
      type: 'okp',
      node: '0',
      for_combo: true
    }
  });
}

function createHolidaysStore() {
  var store = new Ext.data.DirectStore({
    directFn: RPC.Admin.holidayslist,
    paramsAsHash: true,
    root: 'entries',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: ['id', 'date', 'is_workday'],
    sortInfo: {
      field: 'date',
      direction: 'ASC'
    },
    remoteSort: true
  });
  return store;
}

function createOffersLogStore(lot_id) {
  var store = new Ext.data.DirectStore(
  {
    directFn: RPC.Log.offerslog,
    paramsAsHash: true,
    autoSave: true,
    root: 'data',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: [
      'id', 'supplier', 'price', {name: 'date_added', convert: function(v){return parseDate(v);}}
    ],
    baseParams: {
      lot_id : lot_id
    },
    remoteSort: true
  });
  return store;
}

function createShareAccessStore(user_id) {
  var store = new Ext.data.DirectStore(
  {
    api: {
        read    : RPC.User.getorguserslist,
        create  : RPC.User.updateorguserslist,
        update  : RPC.User.updateorguserslist
      },
//   directFn: RPC.User.getorguserslist,
    autoLoad: true,
    autoDestroy: true,
    autoSave: false,
//    writer: new Ext.data.JsonWriter({encode: false, writeAllFields : false}),
    paramsAsHash: true,
    root: 'data',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: [
      'id', 'user', 'choose' 
    ],
    baseParams: {
      user_id : user_id
    },
    remoteSort: true,
    listeners: {
//        load: function(store) {
//          var store = this.getStore();
//          store.load();
//        }
      }
  });
  return store;
}

function createShareProcAccessStore(proc_id){
  var store = new Ext.data.DirectStore(
  {
    api: {
        read    : RPC.User.getprocuserslist,
        create  : RPC.User.updateprocuserslist,
        update  : RPC.User.updateprocuserslist
      },
//   directFn: RPC.User.getprocuserslist,
    autoLoad: true,
    autoDestroy: true,
    autoSave: false,
//    writer: new Ext.data.JsonWriter({encode: false, writeAllFields : false}),
    paramsAsHash: true,
    root: 'data',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: [
      'id', 'user', 'choose' 
    ],
    baseParams: {
      proc_id : proc_id
    },
    remoteSort: true,
    listeners: {
      }
  });
  return store;
}

function createIntentionsStore(list_type) {
  var store_fields = ['lot_id', 'registry_number', 'procedure_title', 'lot_number'];
  if (['my', 'list'].indexOf(list_type)>=0) {
    store_fields.push({name: 'date_added', type: 'date', dateFormat: 'c'});
  }
  if ('list' == list_type) {
    store_fields.push('supplier_inn', 'supplier_name');
  }
  if ('procs' == list_type) {
    store_fields.push('intentions_count');
  }
  var store = new Ext.data.DirectStore({
    directFn: RPC.Applic.intentionslist,
    paramsAsHash: true,
    autoSave: true,
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: store_fields,
    baseParams: {
      list_type: list_type
    },
    remoteSort: true
  });
  return store;
}

function createDepartmentsStore(baseParams, paramsCustom) {
  if (!baseParams) {
    baseParams = {};
  }
  if (!paramsCustom) {
    paramsCustom = {};
  }
  var params = {
    directFn: RPC.User.departmentlist,
    baseParams: baseParams,
    paramsAsHash: true,
    autoSave: true,
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: ['id', 'name', 'code'],
    remoteSort: true
  };

  Ext.apply(params, paramsCustom);
  var store = new Ext.data.DirectStore(params);
  return store;
}

function createDepartmentsForSearchStore() {
  var params = {
    directFn: RPC.User.departmentlistforsearch,
    baseParams: {limit: 100, isActual: 1},
    paramsAsHash: true,
    autoSave: true,
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: ['id', 'name'],
    sortInfo      : {
      field         : 'name',
      direction     : 'ASC'
    },
    remoteSort: true,
    autoLoad:true
  };

  Ext.apply(params);
  var store = new Ext.data.DirectStore(params);
  return store;
}

/**
 * Получение списка пользователей ответственных за закупку.
 * @return {DirectStore} Список пользователей.
 */
function createUserOozStore() {
  return new Ext.data.DirectStore({
    directFn: RPC.User.getAllOOZUnit,
    baseParams: {
      no_transform: true,
      isActual: 0
    },
    paramsAsHash: true,
    autoSave: true,
    root: 'rows',
    idProperty: 'user_id',
    fields: ['user_id', 'user'],
    sortInfo: {
      field: 'user'
    },
    remoteSort: true,
    autoLoad:true
  });
}

/**
 * Получение списка пользователей по роли.
 * @param {Integer} role_id Id роли.
 * @return {DirectStore} Список пользователей.
 */
function createUserListByRoleStore(role_id) {
  return new Ext.data.DirectStore({
    directFn: RPC.User.getUserListByRole,
    baseParams: {
      role_id: role_id
    },
    paramsAsHash: true,
    autoSave: true,
    root: 'rows',
    idProperty: 'id',
    fields: ['id', 'user'],
    sortInfo: {
      field: 'user'
    },
    remoteSort: true,
    autoLoad:true
  });
}

/**
 * Получение списка Функциональных руководителей.
 * @param {Array|Integer|null} status Массив или число с статусом пользователей.
 * @return {DirectStore} Список функциональных руководителей.
 */
function createFunRukForSearchStore(status) {
  var params = {
    directFn: RPC_po.Reference.frFioSearch,
    baseParams: {limit: 100, isActual: 1, query: '', status:(status ? status : null)},
    paramsAsHash: true,
    autoSave: true,
    root: 'fr_fio',
    idProperty: 'fr_fio',
    totalProperty: 'totalCount',
    fields: ['id', 'fr_fio'],
    storeValueField: 'fr_fio',
    remoteSort: true,
    autoLoad:true
  };

  Ext.apply(params);
  var store = new Ext.data.DirectStore(params);
  return store;
}

function createUsersForSearchStore() {
  var params = {
    directFn: RPC.Reference.getCommissionAvailableToAddMembers,
    baseParams: {limit: 100, isActual: 1},
    paramsAsHash: true,
    autoSave: true,
    root: 'member_fio',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: ['id', 'member_fio', 'user_job', 'department_name', 'user_phone'],
    sortInfo      : {
      field         : 'name',
      direction     : 'ASC'
    },
    remoteSort: true,
    autoLoad:true
  };

  Ext.apply(params);
  var store = new Ext.data.DirectStore(params);
  return store;
}

function createUsersShortStore(company_id) {
  return getStore('users_short_store',
  {
    storeId: 'users_short_store',
    directFn: RPC.Admin.getusersshortinfo,
    paramsAsHash: true,
    root: 'entries',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: ['id', 'user_fio', 'user_company', 'user_job'],
    sortInfo: {
      field: 'user_fio',
      direction: 'ASC'
    },
    baseParams: {
      company_id: company_id
    },
    remoteSort: true
  });
}

function createExpertsStore(status) {
  var store = new Ext.data.DirectStore({
    directFn: RPC.User.expertslist,
    paramsAsHash: true,
    autoSave: true,
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: ['id', 'company', 'inn', 'status', 'user_id'],
    sortInfo: {
      field: 'company',
      direction: 'ASC'
    },
    baseParams: {
      status: (status ? status : null)
    },
    remoteSort: true
  });
  return store;
}

/**
 * Creating SMSP storage
 *
 * @returns {object} Return store for SMSP.
 */
function createSmspStorage() {
  return getStore('smsp_resources', {
    autoLoad: true,
    autoSave: false,
    remoteSort: true,
    api: {
      read: RPC.Smsp.list,
      create: RPC.Smsp.edit,
      update: RPC.Smsp.edit,
      destroy: RPC.Smsp.remove
    },
    sortInfo: {
      field: 'okpd2',
      direction: 'ASC'
    },
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    paramsAsHash: true,
    writer: new Ext.data.JsonWriter({encode: false, writeAllFields: true}),
    fields: ['id', 'okpd2', 'okpd2_id', 'name']
  });
}


/**
 * Creating Requirements storage
 *
 * @returns {object} Return store for Requirements.
 */
function createRequirementsStorage() {
  return getStore('requirements_resources', {
    autoLoad: true,
    autoSave: false,
    remoteSort: true,
    api: {
      read: RPC.Requirements.list,
      create: RPC.Requirements.create,
      update: RPC.Requirements.edit,
      destroy: RPC.Requirements.remove
    },
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    paramsAsHash: true,
    writer: new Ext.data.JsonWriter({encode: false, writeAllFields: true}),
    fields: ['id', 'name', 'actual', 'code', 'count']
  });
}


/**
 * Creating budget article directories storage
 *
 * @returns {object} Return store for budget article directories.
 */
function createBudgetArticleDirectoriesStorage() {
  return getStore('budget_article_directories', {
    autoLoad: true,
    autoSave: false,
    remoteSort: true,
    api: {
      read: RPC.Budgetarticledirectories.list,
      create: RPC.Budgetarticledirectories.upsert,
      update: RPC.Budgetarticledirectories.upsert,
      destroy: RPC.Budgetarticledirectories.remove
    },
    sortInfo: {
      field: 'code',
      direction: 'ASC'
    },
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    paramsAsHash: true,
    writer: new Ext.data.JsonWriter({encode: false, writeAllFields: true}),
    fields: [
      'id',
      'code',
      'name'
    ]
  });
}

/**
 * Creating department storage
 *
 * @returns {object} Return store for Departments.
 */
function createDepartmentStorage(userId) {
  return getStore('accountable_department_list_' + userId, {
    autoLoad: true,
    autoSave: false,
    remoteSort: true,
    api: {
      read: RPC_po.Department.list,
      create: RPC_po.Department.edit,
      update: RPC_po.Department.edit,
      destroy: RPC_po.Department.removeLogical
    },
    sortInfo: {
      field: 'name',
      direction: 'ASC'
    },
    baseParams: {
      userId: userId
    },
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    paramsAsHash: true,
    writer: new Ext.data.JsonWriter({encode: false, writeAllFields: true}),
    fields: ['id', 'department_code', 'new_id', 'name', 'fr_fio', 'fr_fio_id', 'users_count', 'is_deleted']
  });
}

/**
 * Creating department storage
 *
 * @returns {object} Return store for Departments.
 */
function createDepartmentAgreeStorage() {
  return getStore('accountable_department_agree_list', {
    autoLoad: true,
    autoSave: false,
    remoteSort: true,
    api: {
      read: RPC_po.Department.listAgree,
      create: RPC_po.Department.createAgree,
      update: RPC_po.Department.editAgree,
      destroy: RPC_po.Department.removeAgree
    },
    sortInfo: {
      field: 'name',
      direction: 'ASC'
    },
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    paramsAsHash: true,
    writer: new Ext.data.JsonWriter({encode: false, writeAllFields: true}),
    fields: ['id', 'department_code', 'new_id', 'name', 'fr_fio', 'fr_fio_id']
  });
}

/**
 * Creating messages storage
 *
 * @returns {object} Return store for Messages.
 */
function createMessageStorage() {
  return new Ext.data.DirectStore({
    autoLoad: true,
    autoSave: false,
    remoteSort: true,
    api: {
      read: RPC.Message.list,
      create: RPC.Message.edit,
      update: RPC.Message.edit,
      destroy: RPC.Message.remove
    },
    sortInfo: {
      field: 'date_edit',
      direction: 'ASC'
    },
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    paramsAsHash: true,
    writer: new Ext.data.JsonWriter({encode: false, writeAllFields: true}),
    fields: ['id', 'content', 'date_add', 'date_edit', 'date_start', 'date_end', 'type', 'user_fio', 'department_name']
  });
}

/**
 * Get all codes of departments
 *
 * @returns {object} Return array of departments codes with ids as keys.
 */
function getDepartmentCodesStorage() {
  var store = getStore('department_codes', {
    autoLoad: true,
    directFn: RPC_po.Department.getCodes,
    root: 'rows',
    idProperty: 'id',
    fields: ['id', 'code']
  });
  var codes = [];
  store.load({
    callback: function(records, operation, success) {
      if (success == true) {
        for (var elem in records) {
          if (!records.hasOwnProperty(elem)) {
            continue;
          }

          codes[records[elem]["id"]] = records[elem].data["code"];
        }
      } else {
        console.log("Error occurd during getting department codes");
      }
    }
  });
  return codes;
}

/**
 * Creating Agreement storage
 *
 * @param {int} procedure_id
 *
 * @returns {object} Return store for Agreement.
 */
function createAgreementStorage(procedure_id) {
  return getStore('agreement_resources', {
    autoLoad: true,
    autoSave: false,
    remoteSort: true,
    sortInfo: {
      field: 'id',
      direction: 'ASC'
    },
    api: {
      read: RPC_po.Procedure.loadagreementcomments
    },
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    baseParams: {
      limit: 25,
      start: 0,
      procedure_id: procedure_id
    },
    fields: [
      'id',
      'user_id',
      'user_name',
      'first_name',
      'middle_name',
      'last_name',
      'department_name',
      'comment',
      'type',
      'step_title',
      'date_add'
    ]
  });
}

/**
 * Creating contract execute document storage.
 *
 * @param {int} lot_id Идентификатор лота.
 *
 * @returns {object} Return store for contract execute document.
 */
function createContractExecuteDocumentStorage(lot_id) {
  return getStore('execute_document_'.lot_id, {
    autoLoad: false,
    autoSave: false,
    remoteSort: true,
    sortInfo: {
      field: 'id',
      direction: 'ASC'
    },
    api: {
      read: RPC_cm.Contract.loadExecuteDocuments,
        destroy: RPC_cm.Contract.removeExecuteDocument
    },
    root: 'documents',
    idProperty: 'id',
    totalProperty: 'totalCount',
    baseParams: {
      lot_id: lot_id
    },
    writer: new Ext.data.JsonWriter({encode: false}),
    fields: [
      'id',
      'document_code',
      'document_name',
      'is_publish_to_oos',
      'is_oos_published',
      'document_number',
      'document_date',
      'file_name',
      'description',
      'position',
      'count',
      'okei_symbol',
        'contract_stage_number',
        'is_removable',
        'contract_payment_id',
        'payment_doc'
    ]
  });
}

/**
 * Creating lot product storage.
 *
 * @param {int} lot_id Идентификатор лота.
 *
 * @returns {object} Return store for lot product.
 */
function createProcedureLotProductsStorage(lot_id) {
  return getStore('lots_units_name_' + lot_id, {
    autoLoad: true,
    autoSave: false,
    remoteSort: false,
    sortInfo: {
      field: 'id',
      direction: 'ASC'
    },
    api: {
      read: RPC.Reference.getLotsProductName
    },
    root: 'list',
    idProperty: 'id',
    totalProperty: 'totalCount',
    baseParams: {
      lot_id: lot_id
    },
    fields: [
      'id',
      'name'
    ]
  });
}
/**
 * Creating contract payment storage.
 *
 * @param {int} lot_id Идентификатор лота.
 *
 * @returns {object} Return store for contract payment.
 */
function createContractPaymentsStorage(lot_id) {
  return getStore('contract_payment_doc_' + lot_id, {
    autoLoad: true,
    autoSave: false,
    remoteSort: false,
    sortInfo: {
      field: 'id',
      direction: 'ASC'
    },
    api: {
      read: RPC_cm.Payment.getContractPaymentDoc
    },
    root: 'list',
    idProperty: 'id',
    totalProperty: 'totalCount',
    baseParams: {
      lot_id: lot_id
    },
    fields: [
      'id',
      'number_1c'
    ]
  });
}

/**
 * Creating meeting comments storage.
 *
 * @param {int} commission_id Идентификатор комиссии.
 *
 * @returns {object} Return store meeting comments storage.
 */
function getMeetingCommentsStore(commission_id) {
  return getStore('commission_comments_store_' + commission_id, {
    autoLoad: true,
    autoSave: false,
    remoteSort: false,
    sortInfo: {
      field: 'id',
      direction: 'ASC'
    },
    api: {
      read: RPC_po.Commission.getListMeetingComment
    },
    root: 'comments',
    idProperty: 'id',
    totalProperty: 'totalCount',
    baseParams: {
      commission_id: commission_id
    },
    fields: [
      {name: 'id'},
      {name: 'type'},
      {name: 'comment'},
      {name: 'first_name'},
      {name: 'middle_name'},
      {name: 'last_name'},
      {name: 'date'}
    ]
  });
}
/**
 * Creating request comments storage.
 *
 * @param {int} request_id Идентификатор комиссии.
 *
 * @returns {object} Return store request comments storage.
 */
function getRequestCommentsStore(request_id) {
  return getStore('request_comments_store_' + request_id, {
    autoLoad: true,
    autoSave: false,
    remoteSort: false,
    sortInfo: {
      field: 'id',
      direction: 'ASC'
    },
    api: {
      read: RPC.Procedure.getListRequestComment
    },
    root: 'comments',
    idProperty: 'id',
    totalProperty: 'totalCount',
    baseParams: {
      request_id: request_id
    },
    fields: [
      {name: 'id'},
      {name: 'type'},
      {name: 'comment'},
      {name: 'first_name'},
      {name: 'middle_name'},
      {name: 'last_name'},
      {name: 'date'}
    ]
  });
}
function createVocabProcedureStepsStore() {
  var store = new Ext.data.DirectStore({
    directFn: RPC.Admin.vocabprocedurestepslist,
    paramsAsHash: true,
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: ['id', 'pseudo', 'full_name'],
    sortInfo: {
      field: 'status',
      direction: 'desc'
    },
    remoteSort: true
  });
  return store;
}

/**
 * Стор Справочник периодичности поставки.
 *
 * @param {Object} params Параметры.
 *
 * @returns {object} Возвращает Стор Справочник периодичности поставки.
 */
function createVocabSupplyPeriodicityStore(params) {
  if (!params) {
    params = {};
  }
  return getStore('vocab_supply_periodicity_list', {
    autoLoad: true,
    autoSave: false,
    remoteSort: true,
    api: {
      read: RPC.Periodicity.list,
      create: RPC.Periodicity.edit,
      update: RPC.Periodicity.edit,
      destroy: RPC.Periodicity.remove
    },
    sortInfo: {
      field: 'name',
      direction: 'ASC'
    },
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    paramsAsHash: true,
    baseParams: params,
    writer: new Ext.data.JsonWriter({encode: false, writeAllFields: true}),
    fields: ['id', 'name', 'actual']
  });
}

/**
 * Стор СМПС Информации.
 * @returns {Object} Объект.
 */
function getSmspInfoStore() {
  var cmpStore = new Ext.data.DirectStore(
    {
      storeId: 'smsp_info',
      directFn: RPC.Reference.getSmspInfo,
      paramsAsHash: true,
      autoLoad: true,
      remoteSort: true,
      idProperty: 'id',
      root: 'rows',
      fields: ['id', 'info'],
      sortInfo: {
        field: 'id',
        direction: 'ASC'
      }
    }
  );
  return cmpStore;
}
/**
 * Справочник НДС
 *
 * @returns {object} Возвращает справочник НДС.
 */
function createVocabVatStorage() {
  return getStore('vocab_vat', {
    autoLoad: true,
    autoSave: false,
    remoteSort: true,
    api: {
      read: RPC.Vocabvat.list,
      create: RPC.Vocabvat.upsert,
      update: RPC.Vocabvat.upsert,
      destroy: RPC.Vocabvat.remove
    },
    sortInfo: {
      field: 'code',
      direction: 'ASC'
    },
    root: 'rows',
    idProperty: 'id',
    totalProperty: 'totalCount',
    paramsAsHash: true,
    writer: new Ext.data.JsonWriter({encode: false, writeAllFields: true}),
    fields: [
      'id',
      'name',
      'value'
    ]
  });
}
