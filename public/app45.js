let provider = null;
let connection = null;
let walletPublicKey = null;

// Devnet connection
connection = new solanaWeb3.Connection(
  solanaWeb3.clusterApiUrl("devnet"),
  "confirmed"
);

// Phantom detection
function getProvider() {
  if ("solana" in window) {
    const provider = window.solana;
    if (provider.isPhantom) return provider;
  }
  window.open("https://phantom.app/", "_blank");
}

document.getElementById("connectBtn").onclick = async () => {
  provider = getProvider();

  try {
    const resp = await provider.connect();
    walletPublicKey = resp.publicKey.toString();

    document.getElementById("status").innerText =
      "Connected: " + walletPublicKey;

    document.getElementById("sendBtn").disabled = false;

  } catch (err) {
    console.error(err);
  }
};
