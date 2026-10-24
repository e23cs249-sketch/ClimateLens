// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

/**
 * @title ClimateEvidenceAnchor
 * @author ClimateLens Engineering Team (IEEE ClimateChain Global Hackathon 2026)
 * @notice Anchors deterministic RFC 8785 SHA-256 climate evidence digests on Polygon Amoy.
 * @dev Provides immutable public timestamping and verification for environmental evidence snapshots.
 */
contract ClimateEvidenceAnchor {
    address public immutable owner;

    struct AnchorRecord {
        bytes32 evidenceHash;
        string locationLabel;
        uint256 timestamp;
        address registeredBy;
    }

    mapping(bytes32 => AnchorRecord) public records;

    event EvidenceAnchored(
        bytes32 indexed evidenceHash,
        string locationLabel,
        uint256 indexed timestamp,
        address indexed registeredBy
    );

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Anchors a 32-byte SHA-256 evidence digest on-chain.
     * @param _evidenceHash 32-byte hash computed via RFC 8785 canonicalization.
     * @param _locationLabel Human-readable location identifier (e.g., "Chennai, Tamil Nadu, India").
     */
    function anchorEvidence(bytes32 _evidenceHash, string calldata _locationLabel) external {
        require(_evidenceHash != bytes32(0), "Invalid empty evidence hash");
        require(records[_evidenceHash].timestamp == 0, "Evidence hash already registered on-chain");
        
        records[_evidenceHash] = AnchorRecord({
            evidenceHash: _evidenceHash,
            locationLabel: _locationLabel,
            timestamp: block.timestamp,
            registeredBy: msg.sender
        });

        emit EvidenceAnchored(_evidenceHash, _locationLabel, block.timestamp, msg.sender);
    }

    /**
     * @notice Verifies if an evidence digest has been anchored and returns its metadata.
     * @param _evidenceHash The 32-byte SHA-256 hash to verify.
     * @return isAnchored True if the hash exists in the contract storage.
     * @return timestamp The block timestamp when the evidence was registered.
     * @return locationLabel The recorded location label.
     */
    function verifyEvidence(bytes32 _evidenceHash)
        external
        view
        returns (bool isAnchored, uint256 timestamp, string memory locationLabel)
    {
        AnchorRecord memory record = records[_evidenceHash];
        if (record.timestamp == 0) {
            return (false, 0, "");
        }
        return (true, record.timestamp, record.locationLabel);
    }
}
