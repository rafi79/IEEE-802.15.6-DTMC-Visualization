'use client'

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Info } from 'lucide-react';

const DTMCVisualization = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentState, setCurrentState] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [selectedClass, setSelectedClass] = useState('UP0');
  const [showTransitions, setShowTransitions] = useState(true);
  const [transitionHistory, setTransitionHistory] = useState([]);

  // System parameters from our calculation
  const systems = {
    UP0: {
      name: 'UP0 (Low Priority)',
      CPmax: 0.125,
      CPmin: 0.0625,
      states: [
        { id: 0, CP: 0.125, success: 0.071486, collision: 0.053514, idle: 0.875 },
        { id: 1, CP: 0.125, success: 0.071486, collision: 0.053514, idle: 0.875 },
        { id: 2, CP: 0.0625, success: 0.035743, collision: 0.026757, idle: 0.9375 }
      ],
      steadyState: [0.869814, 0.093019, 0.037167],
      color: '#ef4444'
    },
    UP5: {
      name: 'UP5 (High Priority)',
      CPmax: 0.375,
      CPmin: 0.1875,
      states: [
        { id: 0, CP: 0.375, success: 0.299956, collision: 0.075044, idle: 0.625 },
        { id: 1, CP: 0.375, success: 0.299956, collision: 0.075044, idle: 0.625 },
        { id: 2, CP: 0.1875, success: 0.149978, collision: 0.037522, idle: 0.8125 }
      ],
      steadyState: [0.852357, 0.127947, 0.019696],
      color: '#3b82f6'
    }
  };

  const currentSystem = systems[selectedClass];

  // Simulate state transitions
  const simulateTransition = () => {
    const state = currentSystem.states[currentState];
    const rand = Math.random();
    
    let nextState = currentState;
    let event = '';

    if (currentState === 0) {
      if (rand < state.success) {
        nextState = 0;
        event = 'success';
      } else if (rand < state.success + state.collision) {
        nextState = 1;
        event = 'collision';
      } else {
        nextState = 0;
        event = 'idle';
      }
    } else if (currentState === 1) {
      if (rand < state.success) {
        nextState = 0;
        event = 'success';
      } else if (rand < state.success + state.collision) {
        nextState = 2;
        event = 'collision';
      } else {
        nextState = 1;
        event = 'idle';
      }
    } else { // state 2
      if (rand < state.success) {
        nextState = 0;
        event = 'success';
      } else if (rand < state.success + state.collision) {
        nextState = 2;
        event = 'collision';
      } else {
        nextState = 2;
        event = 'idle';
      }
    }

    setCurrentState(nextState);
    setStepCount(prev => prev + 1);
    setTransitionHistory(prev => [
      ...prev.slice(-9),
      { from: currentState, to: nextState, event, step: stepCount + 1 }
    ]);
  };

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(simulateTransition, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentState, stepCount]);

  const reset = () => {
    setIsPlaying(false);
    setCurrentState(0);
    setStepCount(0);
    setTransitionHistory([]);
  };

  const getStateColor = (stateId) => {
    if (stateId === currentState) {
      return currentSystem.color;
    }
    return '#e5e7eb';
  };

  const getTransitionOpacity = (from, to) => {
    if (!showTransitions) return 0;
    
    const state = currentSystem.states[from];
    let prob = 0;
    
    if (from === 0 && to === 0) prob = state.success + state.idle;
    else if (from === 0 && to === 1) prob = state.collision;
    else if (from === 1 && to === 0) prob = state.success;
    else if (from === 1 && to === 1) prob = state.idle;
    else if (from === 1 && to === 2) prob = state.collision;
    else if (from === 2 && to === 0) prob = state.success;
    else if (from === 2 && to === 2) prob = state.collision + state.idle;
    
    return prob * 0.8;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          IEEE 802.15.6 DTMC Visualization
        </h1>
        <p className="text-gray-600">
          Interactive simulation of the Discrete Time Markov Chain for slotted Aloha protocol
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            isPlaying 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
        >
          <RotateCcw size={20} />
          Reset
        </button>

        <select
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            reset();
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg font-medium"
        >
          <option value="UP0">UP0 (Low Priority)</option>
          <option value="UP5">UP5 (High Priority)</option>
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showTransitions}
            onChange={(e) => setShowTransitions(e.target.checked)}
            className="rounded"
          />
          <span className="font-medium">Show Transition Probabilities</span>
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DTMC Diagram */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">{currentSystem.name} - State Diagram</h2>
          
          <svg viewBox="0 0 500 350" className="w-full h-80 border rounded">
            {/* Transition arrows */}
            {showTransitions && (
              <g stroke="#6b7280" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)">
                {/* Self loops */}
                <path
                  d="M 100 80 Q 100 40 140 80"
                  opacity={getTransitionOpacity(0, 0)}
                  strokeWidth="3"
                />
                <path
                  d="M 250 80 Q 250 40 290 80"
                  opacity={getTransitionOpacity(1, 1)}
                  strokeWidth="3"
                />
                <path
                  d="M 400 80 Q 400 40 440 80"
                  opacity={getTransitionOpacity(2, 2)}
                  strokeWidth="3"
                />
                
                {/* Forward transitions */}
                <path
                  d="M 140 100 Q 200 120 210 100"
                  opacity={getTransitionOpacity(0, 1)}
                  strokeWidth="3"
                />
                <path
                  d="M 290 100 Q 350 120 360 100"
                  opacity={getTransitionOpacity(1, 2)}
                  strokeWidth="3"
                />
                
                {/* Return to state 0 */}
                <path
                  d="M 210 140 Q 150 180 100 140"
                  opacity={getTransitionOpacity(1, 0)}
                  strokeWidth="3"
                />
                <path
                  d="M 360 140 Q 250 200 100 140"
                  opacity={getTransitionOpacity(2, 0)}
                  strokeWidth="3"
                />
              </g>
            )}

            {/* Arrow marker */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                      refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>

            {/* States */}
            {[0, 1, 2].map((stateId) => (
              <g key={stateId}>
                <circle
                  cx={100 + stateId * 150}
                  cy={100}
                  r="40"
                  fill={getStateColor(stateId)}
                  stroke="#374151"
                  strokeWidth="3"
                  className="transition-all duration-500"
                />
                <text
                  x={100 + stateId * 150}
                  y={105}
                  textAnchor="middle"
                  className="text-2xl font-bold fill-white"
                >
                  {stateId}
                </text>
                
                {/* State info */}
                <text
                  x={100 + stateId * 150}
                  y={160}
                  textAnchor="middle"
                  className="text-sm font-medium fill-gray-700"
                >
                  CP = {currentSystem.states[stateId].CP.toFixed(3)}
                </text>
                <text
                  x={100 + stateId * 150}
                  y={180}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  π = {currentSystem.steadyState[stateId].toFixed(3)}
                </text>
              </g>
            ))}

            {/* Current state indicator */}
            <circle
              cx={100 + currentState * 150}
              cy={100}
              r="50"
              fill="none"
              stroke={currentSystem.color}
              strokeWidth="4"
              strokeDasharray="8,4"
              className="animate-pulse"
            />

            {/* Legend */}
            <text x={20} y={280} className="text-sm font-bold fill-gray-700">
              Current State: {currentState}
            </text>
            <text x={20} y={300} className="text-sm fill-gray-600">
              Step: {stepCount}
            </text>
            <text x={20} y={320} className="text-sm fill-gray-600">
              CP = Contention Probability
            </text>
          </svg>
        </div>

        {/* State Information Panel */}
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-blue-800 mb-2 flex items-center gap-2">
              <Info size={20} />
              Current State Information
            </h3>
            <div className="space-y-2 text-sm">
              <div><strong>State:</strong> {currentState}</div>
              <div><strong>Contention Probability:</strong> {currentSystem.states[currentState].CP.toFixed(3)}</div>
              <div><strong>Success Probability:</strong> {currentSystem.states[currentState].success.toFixed(4)}</div>
              <div><strong>Collision Probability:</strong> {currentSystem.states[currentState].collision.toFixed(4)}</div>
              <div><strong>Idle Probability:</strong> {currentSystem.states[currentState].idle.toFixed(4)}</div>
              <div><strong>Steady-State Probability:</strong> {currentSystem.steadyState[currentState].toFixed(4)}</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Transition Rules</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div><strong>State 0:</strong> Fresh packet, highest CP</div>
              <div><strong>State 1:</strong> 1 failure, same CP (odd failure)</div>
              <div><strong>State 2:</strong> 2+ failures, reduced CP (even failure)</div>
              <div className="mt-3 pt-3 border-t">
                <div><strong>Success:</strong> Packet sent successfully → State 0</div>
                <div><strong>Collision:</strong> Packet collides → Next state</div>
                <div><strong>Idle:</strong> No transmission attempt → Same state</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-green-800 mb-2">Recent Transitions</h3>
            <div className="space-y-1 text-sm">
              {transitionHistory.slice(-5).map((transition, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>Step {transition.step}:</span>
                  <span className="font-mono">
                    {transition.from} → {transition.to} ({transition.event})
                  </span>
                </div>
              ))}
              {transitionHistory.length === 0 && (
                <div className="text-gray-500 italic">Press Play to start simulation</div>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-yellow-800 mb-2">System Comparison</h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-bold text-red-600">UP0 (Low Priority)</div>
                  <div>CPmax: 0.125 (1/8)</div>
                  <div>CPmin: 0.0625 (1/16)</div>
                  <div>State 0 time: 87.0%</div>
                </div>
                <div>
                  <div className="font-bold text-blue-600">UP5 (High Priority)</div>
                  <div>CPmax: 0.375 (3/8)</div>
                  <div>CPmin: 0.1875 (3/16)</div>
                  <div>State 0 time: 85.2%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gray-100 p-4 rounded-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-2">How It Works</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p><strong>1. State Representation:</strong> Each state represents the number of consecutive transmission failures for a packet.</p>
          <p><strong>2. Contention Probability (CP):</strong> Determines how likely a device is to attempt transmission in any given time slot.</p>
          <p><strong>3. Priority Implementation:</strong> Higher priority classes have higher CP values, giving them better transmission chances.</p>
          <p><strong>4. Backoff Mechanism:</strong> After failures, CP reduces (only on even-numbered failures), implementing collision avoidance.</p>
          <p><strong>5. Steady-State:</strong> The system reaches equilibrium where devices spend most time in State 0 (fresh packets).</p>
        </div>
      </div>
    </div>
  );
};

export default DTMCVisualization;
