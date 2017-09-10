/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Haruno create
 * @param {org.acme.trading.Purchase} purchase - the trade to be processed
 * @transaction
 */
function onPurchase(purchase) {
    purchase.seller.wallet.money += purchase.cost
    purchase.buyer.wallet.money -= purchase.cost * purchase.costRate
    purchase.seller.production.power -= purchase.power
    purchase.buyer.consumption.power -= purchase.power * purchase.lossRate
    // set the new owner of the commodity
    // trade.commodity.owner = trade.newOwner;
    return getAssetRegistry('org.acme.trading.Wallet')
        .then(function (assetRegistry) {
            // persist the state of the commodity
            return assetRegistry.updateAll([purchase.seller.wallet,purchase.buyer.wallet]);
        })
        .then(function (){
            return getAssetRegistry('org.acme.trading.Consumption')
        })
        .then(function (assetRegistry) {
            // persist the state of the commodity
            return assetRegistry.update(purchase.buyer.consumption);
        })
        .then(function (){
            return getAssetRegistry('org.acme.trading.Production')
        })
        .then(function (assetRegistry) {
            // persist the state of the commodity
            return assetRegistry.update(purchase.seller.production);
        });
}
/**
 * Haruno create
 * @param {org.acme.trading.PutAction} put - the trade to be processed
 * @transaction
 */
function onPutAction(put) {
    var gain = put.produce - put.consume
    var isProduction = (gain >= 0)
    var isConsumption = (gain <= 0)
    var toZeroProduction = false
    if(isProduction){
        put.production.power = gain 
    }
    if(isConsumption){
        put.consumption.power += -gain
        if(put.production.power!=0){
            toZeroProduction = true
            put.production.power = 0
        }
    }
    return getAssetRegistry('org.acme.trading.Production')
        .then(function (assetRegistry) {
            // persist the state of the commodity
            if(isProduction || toZeroProduction){
                return assetRegistry.update(put.production);
            }else{
                return true;
            }
        })
        .then(function () {
            // persist the state of the commodity
            return getAssetRegistry('org.acme.trading.Consumption')
        })
        .then(function (assetRegistry) {
            // persist the state of the commodity
            if(isConsumption){
                return assetRegistry.update(put.consumption);
            }else{
                return true;
            }
        });
}

/**
 * Haruno create
 * @param {org.acme.trading.PutConsumption} put - the trade to be processed
 * @transaction
 */
function onPutConsumption(put) {
    put.consumption.power += put.power
    
    return getAssetRegistry('org.acme.trading.Consumption')
        .then(function (assetRegistry) {
            // persist the state of the commodity
            return assetRegistry.update(put.consumption);
        });
}

/**
 * Haruno create
 * @param {org.acme.trading.PutProduction} put - the trade to be processed
 * @transaction
 */
function onPutProduction(put) {
    put.production.power = put.power
    return getAssetRegistry('org.acme.trading.Production')
        .then(function (assetRegistry) {
            // persist the state of the commodity
            return assetRegistry.update(put.production);
        });
}

/**
 * Haruno create
 * @param {org.acme.trading.PutStorage} put - the trade to be processed
 * @transaction
 */
function onPutStorage(put) {
    put.storage.power += put.power
    return getAssetRegistry('org.acme.trading.Storage')
        .then(function (assetRegistry) {
            // persist the state of the commodity
            return assetRegistry.update(put.storage);
        });
}
