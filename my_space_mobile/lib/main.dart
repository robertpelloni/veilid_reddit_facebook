import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Veilid MySpace',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const SovereigntyScreen(),
    );
  }
}

class SovereigntyScreen extends StatefulWidget {
  const SovereigntyScreen({super.key});

  @override
  State<SovereigntyScreen> createState() => _SovereigntyScreenState();
}

class _SovereigntyScreenState extends State<SovereigntyScreen> {
  String? _identityKey;
  bool _isLoading = false;
  String _status = 'Disconnected';

  Future<void> _authenticate() async {
    setState(() {
      _isLoading = true;
      _status = 'Generating Veilid P2P Key Pair...';
    });

    try {
      // Connect to local Go sidecar RPC
      final response = await http.post(
        Uri.parse('http://127.0.0.1:1337/identity/generate'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _identityKey = data['dht_key'];
          _status = 'Connected to Veilid Core';
        });
      } else {
        setState(() {
          _status = 'Failed to generate identity: ${response.statusCode}';
        });
      }
    } catch (e) {
      setState(() {
        _status = 'Go sidecar unavailable. Ensure it is running on 127.0.0.1:1337';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Veilid MySpace Mobile'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.hub, size: 80, color: Colors.blue),
              const SizedBox(height: 24),
              if (_identityKey == null) ...[
                const Text(
                  'Sovereign Identity',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Generate a new cryptographically secure routing pair to interact on the decentralized social fabric.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: _isLoading ? null : _authenticate,
                  child: _isLoading
                      ? const CircularProgressColor()
                      : const Text('Generate Identity & Connect'),
                ),
              ] else ...[
                const Text(
                  'Authenticated',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.green),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: SelectableText(
                    _identityKey!,
                    style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 16),
                const Text('Your sandboxed profile iframe will render here.'),
              ],
              const SizedBox(height: 32),
              Text(
                'Status: $_status',
                style: TextStyle(color: Colors.grey[600], fontStyle: FontStyle.italic),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class CircularProgressColor extends StatelessWidget {
  const CircularProgressColor({super.key});

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      width: 20,
      height: 20,
      child: CircularProgressIndicator(strokeWidth: 2),
    );
  }
}
