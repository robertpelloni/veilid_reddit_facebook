module github.com/robertpelloni/veilid_reddit_facebook

go 1.22

require github.com/mattn/go-sqlite3 v1.14.24

require github.com/mr-tron/base58 v1.2.0

require github.com/robertpelloni/bobcoin/go-lattice v0.0.0
replace github.com/robertpelloni/bobcoin/go-lattice => ./src-tauri/background/lattice
