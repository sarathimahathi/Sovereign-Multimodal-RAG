# Models Module

## Purpose
Provides unified driver abstractions for local and remote inference engines.

## Phase Milestone
Targeted for **Phase 4: Local Model Adapters**.

## Subcomponents to be implemented:
- `ollama_adapter.py`: Direct connection to Ollama daemon.
- `vllm_adapter.py`: High-throughput local GPU inference.
- `gguf_runner.py`: Direct CPU/GPU quantized model inference via llama.cpp.
- `base.py`: Unified `BaseLLM` interface for uniform inference calls.
