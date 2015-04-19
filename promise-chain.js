/**
 * @file Manages a chain of promises with serial and paralell capabilities. 
 * @copyright Ben Mackie 2015
 * @license Apache-2.0
 */
'use strict';
var Promise = require('bluebird');
var PromiseFork = require('./promise-fork');

/**
 * @class
 */
function PromiseChain(parent) {
    var _this = this;

    if (parent && typeof parent.then != 'function')
        throw new Error('Argument specified not a promise.');

    var _promise = parent || Promise.resolve();
    var _fork = null;

    /**
     * Add a promiser style function (a functions that returns a promise) to the chain.
     */
    _this.addPromiser = function(promiser) {
        if (_fork)
            _fork.addPromiser(promiser);
        else
            _promise = _promise.then(promiser);
        return _this;      
    }

    /**
     * Add a resolver style function (a functions that has resolver and reject callback 
     * arguments respectively) to the chain.
     */
    _this.addResolver = function(resolver) {
        return _this.addPromiser(function() { return new Promise(resolver); });
    }

    /**
     * Maps one or more functions to items in a collection in order to yield a collection of
     * promisers to add to the chain.
     * @param collection - the collection to enumerate.
     * @param promiser - the promiser 
     */
     /*
    _this.mapPromiser = function(collection, promisers) {
        // Support one or more tasks to map.
         // TODO: Support either a function or an array of functions.
        if (promisers.constructor != Array)
            promisers = [promisers];

        // Loop over items in collection and add promiser.
        collection.forEach(function(item) {
            promisers.forEach(function(promiser) {
                _this.addPromiser(function() { return promiser(item); });
            })
        })
        return _this;
    }
    */

    _this.fork = function() {
        _fork = new PromiseFork(_promise);
        return _this;
    }

    _this.join = function() {
        if (_fork) {
            var fork = _fork;
            _fork = null;
            _promise = fork.join();
        }
        return _this;
    }

    _this.joinAny = function() {
        if (_fork) {
            var fork = _fork;
            _fork = null;
            _promise = fork.joinAny();
        }
        return _this;
    }

    _this.joinSettle = function() {
        if (_fork) {
            var fork = _fork;
            _fork = null;
            _promise = fork.joinSettle();
        }
        return _this;
    }

    _this.promise = function() {
        return _promise;
    }

    _this.then = function() {
        this.join();
        return _promise.then.apply(_promise, arguments);
    }
};

module.exports = PromiseChain;