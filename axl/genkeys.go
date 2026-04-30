package main

import (
	"encoding/hex"
	"fmt"

	"github.com/yggdrasil-network/yggdrasil-go/src/config"
)

func main() {
	for i := 0; i < 3; i++ {
		cfg := config.GenerateConfig()
		fmt.Printf("PublicKey%d: %s\n", i, hex.EncodeToString(cfg.PublicKey))
		fmt.Printf("PrivateKey%d: %s\n", i, hex.EncodeToString(cfg.PrivateKey))
	}
}
