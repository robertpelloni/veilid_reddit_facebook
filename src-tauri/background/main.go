package main

import (
	"fmt"
	"net/http"

	"github.com/robertpelloni/veilid_reddit_facebook/src-tauri/background/client"
)

func main() {
	fmt.Println("Veilid Sidecar Starting...")

	// Example of starting an internal RPC server for the Tauri frontend to call
	http.HandleFunc("/publish", func(w http.ResponseWriter, r *http.Request) {
		// Implementation details...
		fmt.Fprintf(w, "Publish endpoint")
	})

	// In a real scenario, we'd read the Veilid RPC address from a config or env
	veilidClient := client.NewVeilidClient("http://localhost:5959")
	_ = veilidClient

	fmt.Println("Sidecar listening on :1337")
	if err := http.ListenAndServe(":1337", nil); err != nil {
		fmt.Printf("Error starting sidecar: %v\n", err)
	}
}
