/* global moment */
function smRangePicker (picker){
    return{
        restrict : 'E',
        require : ['^?ngModel', 'smRangePicker'],
        scope:{
            format:'@',
            divider: '@',
            initStartDate: '@',
            initEndDate: '@',
            dateType: '=',
            dateTypeList: '=',
            weekStartDay :'@',
            customToHome: '@',
            closeOnSelect: '@',
            mode: '@',
            showCustom:'@',
            customList: '=',
            minDate : '@',
            maxDate : '@',
            allowClear: '@',
            allowEmpty: '@',
            rangeSelectCall : '&'
        },
        terminal:true,
        controller: ['$scope', 'picker', 'moment', 'alerts', RangePickerCtrl],
        controllerAs : 'vm',
        bindToController:true,
        templateUrl : 'picker/range-picker.html',
        link : function(scope, element, att, ctrls){
            var ngModelCtrl = ctrls[0];
            var calCtrl = ctrls[1];
            calCtrl.configureNgModel(ngModelCtrl);

            scope.$watch(function() {
                return ngModelCtrl.$modelValue;
            }, function(nv, ov) {
                var preset = _.find(calCtrl.customList, function(it) { return it.label === nv });

                if (preset) {
                    calCtrl.lastPreset = preset;
                    scope.$emit('range-picker:modelChanged', preset);
                }
            })
        }
    }
}

var RangePickerCtrl = function($scope, picker, moment, alerts){
    var self = this;
    self.scope = $scope;
    self.clickedButton = 0;
    self.startShowCustomSettting =self.showCustom;
    self.alerts = alerts ;

    self.startDate = moment(self.initStartDate);
    self.endDate = moment(self.initEndDate);

    self.lastRange = {
        startDate: self.startDate.clone(),
        endDate: self.endDate.clone()
    };

    self.divider = angular.isUndefined(self.scope.divider) || self.scope.divider ===''? picker.rangeDivider : $scope.divider;

    //display the clear button?
    self.showClearButton = self.allowClear === 'true' || false;
    //allow set start/end date as empty value
    self.allowEmptyDates = self.allowEmpty === 'true' || false;

    self.okLabel = picker.okLabel;
    self.cancelLabel = picker.cancelLabel;
    self.clearLabel = picker.clearLabel;
    self.customRangeLabel = picker.customRangeLabel;
    self.view = 'DATE';

    self.rangeCustomStartEnd = picker.rangeCustomStartEnd;
    var defaultList = [];
    angular.copy(picker.rangeDefaultList, defaultList);
    self.rangeDefaultList = defaultList;
    if(self.customList){
        self.rangeDefaultList = self.customList;
        /*
        for (var i = 0; i < self.customList.length; i++) {
            self.rangeDefaultList[self.customList[i].position] = self.customList[i];
        }*/
    }

    if(self.showCustom){
        self.selectedTabIndex=0;
    }else{
        self.selectedTabIndex = $scope.selectedTabIndex;
    }

    self.isInputOk = true;

    $scope.$on('range-picker-input:blur', function()
    {
        self.cancel();
    });

    $scope.$on('range-picker:input-error', function(evt, data) {
        self.isInputOk = false;
    });

    $scope.$on('range-picker:input-ok', function(evt, data) {
        self.isInputOk = true;
    });

    $scope.$watch(function() {
        return self.showCustom;
    }, function(nv, ov) {
        $scope.$emit('range-picker:showCustom', nv);
    })

}

RangePickerCtrl.prototype.configureNgModel = function(ngModelCtrl) {
    this.ngModelCtrl = ngModelCtrl;
    var self = this;
    ngModelCtrl.$render = function() {
        //self.ngModelCtrl.$viewValue= self.startDate+' '+ self.divider +' '+self.endDate;
    };
};

RangePickerCtrl.prototype.setNextView = function(){
    switch (this.mode){
        case 'date':
        this.view = 'DATE';
        if(this.selectedTabIndex ===0 ){
            this.selectedTabIndex =1
        }
        break;
        case 'date-time':
        if(this.view === 'DATE'){
            this.view = 'TIME';
        }else{
            this.view = 'DATE';
            if(this.selectedTabIndex ===0 ){
                this.selectedTabIndex =1
            }
        }
        break;
        default:
        this.view = 'DATE';
        if(this.selectedTabIndex ===0 ){
            this.selectedTabIndex =1
        }
    }
}

RangePickerCtrl.prototype.showCustomView = function(){
    this.showCustom=true;
    this.selectedTabIndex=0

}

RangePickerCtrl.prototype.setDateView = function(idx){
    if(this.showCustom){
        this.selectedTabIndex = idx ;
    }
}

RangePickerCtrl.prototype.setTextFocus = function(idx){
        if(this.showCustom){
            this.setDateView(idx);
        }
}

RangePickerCtrl.prototype.disableApply = function(){
    if (!this.isInputOk) return true;
    
        var disable = false;
        if (this.endDate < this.startDate)
            disable = true;
        return disable
}

RangePickerCtrl.prototype.dateRangeSelected = function(){
    var self = this;

    if (!self.showCustom && self.lastPreset) {
        self.selectPresetRange(self.lastPreset, self.divider);
    } else {

        if (!self.startDate) {
            return self.alerts.error('Start date is invalid, please select again.');
        }

        if (!self.endDate) {
            return self.alerts.error('End date is invalid, please select again.');
        }

        self.lastRange = { startDate: self.startDate.clone(), endDate: self.endDate.clone() };
        self.setNgModelValue(self.startDate, self.divider, self.endDate.endOf('day'));
    }

    self.selectedTabIndex =0;
    self.view= 'DATE';
    if(self.startShowCustomSettting){
        self.showCustom=true;
    }else{
        self.showCustom=false;
    }
    //self.setNgModelValue(self.startDate, self.divider, self.endDate);
}

/* sets an empty value on dates. */
RangePickerCtrl.prototype.clearDateRange = function(){
    var self = this;
    self.selectedTabIndex =0;
    self.view= 'DATE';
    if(self.startShowCustomSettting){
        self.showCustom=true;
    }else{
        self.showCustom=false;
    }
    self.setNgModelValue('', self.divider, '');
}


RangePickerCtrl.prototype.startDateSelected = function(date){
    var _date_copy = angular.copy(date);
    this.startDate = _date_copy.startOf('day');
    this.lastPreset = null;
    this.minStartToDate = _date_copy;
    this.scope.$emit('range-picker:startDateSelected');
    this.setNextView();

    if (this.endDate && this.endDate.diff(this.startDay, 'ms') < 0) {
        this.endDate = date;
    }
}

RangePickerCtrl.prototype.startTimeSelected = function(time){

    this.startDate.hour(time.hour()).minute(time.minute());
    this.minStartToDate = angular.copy(this.startDate);
    this.scope.$emit('range-picker:startTimeSelected');
    this.setNextView();
}


RangePickerCtrl.prototype.endDateSelected = function(date){
    this.endDate = date.endOf('day');
    this.scope.$emit('range-picker:endDateSelected');
    if(this.closeOnSelect && this.mode==='date'){
        this.setNgModelValue(this.startDate, this.divider, this.endDate);
    }else{
        this.setNextView();
    }
}

RangePickerCtrl.prototype.endTimeSelected = function(time){
    this.endDate.hour(time.hour()).minute(time.minute());
    this.scope.$emit('range-picker:endTimeSelected');
    if(this.closeOnSelect && this.mode==='date-time'){
        this.setNgModelValue(this.startDate, this.divider, this.endDate);
    }
}

RangePickerCtrl.prototype.isDifferentDate = function(d1, d2){
    return d1.format("YYYYMMDD") != d2.format("YYYYMMDD")
}

RangePickerCtrl.prototype.updateNewDateInput = function(){
    var newStartDate = moment(this.startDateStr);
    var newEndDate = moment(this.endDateStr) ;

    if(newStartDate.isValid() === false){
        this.alerts.error("wrong input")
        this.startDateStr = this.startDate.format(this.format) ;
        return ;
    }

    if(newEndDate.isValid() === false){
        this.alerts.error("wrong input")
        this.endDateStr = this.endDate.format(this.format) ;
        return ;
    }

    var dd_start = 0, dd_end ;
    dd_start = newStartDate.diff(moment(), "days") ;
    dd_end = newEndDate.diff(moment(), "days")
    if(dd_start >0){
        this.startDateStr = this.startDate.format(this.format) ;
    }
    if(dd_end > 0){
        this.endDateStr = this.endDate.format(this.format) ;
    }
    if(dd_start > 0 || dd_end > 0){
        this.alerts.error("Wrong, the input date is not correct") ;
        return ;
    }

    var dd = newStartDate.diff(newEndDate,"days") ;
    if(dd > 0){
        this.startDateStr = this.startDate.format(this.format) ;
        this.alerts.error("Wrong, start date or end date is not correct") ;
        return ;
    }

    if(this.isDifferentDate(newStartDate, this.startDate)){
        this.startDate = newStartDate ;
        this.lastPreset = null ;
    }
    if(this.isDifferentDate(newEndDate, this.endDate)){
        this.endDate = newEndDate ;
        this.lastPreset = null ;
    }
}


RangePickerCtrl.prototype.selectPresetRange = function(list, divider) {
    var self = this;
    var range;
    if (list.getRange && isFunction(list.getRange)) {
        range = list.getRange();
    } else {
        range = {
            startDate: list.startDate,
            endDate: list.endDate
        };
    }

    range.range = list.value;

    range.dateType = self.dateType.value;

    self.startDate = range.startDate;
    self.endDate = range.endDate;

    self.lastRange = {
        startDate: self.startDate.clone(),
        endDate: self.endDate.clone()
    };

    self.lastPreset = list;

    self.rangeSelectCall({range: range});

    setTimeout(function() {
        self.ngModelCtrl.$setViewValue(list.label);
        self.ngModelCtrl.$render();
    }, 50);
    self.selectedTabIndex = 0;
    self.view ="DATE";
    self.scope.$emit('range-picker:close');
}

function isFunction(obj) {
  return typeof obj == 'function' || false;
}



RangePickerCtrl.prototype.setNgModelValue = function(startDate, divider, endDate) {
    var self = this;

    var range = {
        startDate: startDate,
        endDate: endDate,
        dateType: self.dateType.value
    };

    self.rangeSelectCall({range: range});

    var momentStartDate = startDate || null;
    var momentEndDate = endDate || null;


    if(startDate)
    {
        startDate = startDate.format(self.format) || '';
    }

    if(endDate)
    {
        endDate = endDate.format(self.format) || '';
    }

    var range = {
        startDate: startDate, 
        endDate: endDate, 
        startDateAsMoment: momentStartDate, 
        endDateAsMoment: momentEndDate,
    };

    //var range = {startDate: startDate, endDate: endDate};
    
    var _ng_model_value;

    //if no startDate && endDate, then empty the model.
    if(!startDate && !endDate)
    {
        _ng_model_value = '';
    }else
    {
        startDate = startDate || 'Any';
        endDate = endDate || 'Any';
        _ng_model_value = startDate + ' ' + divider + ' ' + endDate;
    }

    range.text = _ng_model_value;
    
    //self.rangeSelectCall({range: range});
    
    
    setTimeout(function()
    {
        self.ngModelCtrl.$setViewValue(_ng_model_value);
        self.ngModelCtrl.$render();
    }, 50);
    
    
    self.selectedTabIndex = 0;
    self.view ='DATE';
    self.scope.$emit('range-picker:close');
};


RangePickerCtrl.prototype.cancel = function() {
    var self = this;
    if(self.customToHome && self.showCustom) {
        self.showCustom=false;
    }else{
        self.selectedTabIndex =0;
        self.showCustom=false;
        self.scope.$emit('range-picker:close');
    }

    if (self.lastRange) {
        self.startDate = self.lastRange.startDate.clone();
        self.endDate = self.lastRange.endDate.clone();
    }
}

var app = angular.module('smDateTimeRangePicker');
app.directive('smRangePicker', ['picker', smRangePicker]);
